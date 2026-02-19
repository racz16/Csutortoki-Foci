import { PlayerDto } from '@/dtos/player-dto';
import { PlayerListDto } from '@/dtos/player-list-dto';
import { PlayerStateDto } from '@/dtos/player-state-dto';
import { DEFAULT_MU, DEFAULT_SIGMA, preventPrerenderingInCiPipeline, ValidationError } from '@/utility';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ordinal } from 'openskill';
import prismaClient from './prisma';
import { updateGlobalStatistics, updatePlayerStatistics } from './statistics';
import { authOptions } from './users';

interface PlayerQueryResult {
    id: number;
    name: string;
    mu: number;
    sigma: number;
    regular: boolean;
    _count: { teamPlayer: number };
}

interface EditPlayerQueryResult {
    name: string;
    regular: boolean;
    _count: { teamPlayer: number; playerStatistic: number };
}

interface DeletePlayerQueryResult {
    regular: boolean;
    _count: { teamPlayer: number; playerStatistic: number };
}

export async function getPlayerCount(): Promise<number> {
    await preventPrerenderingInCiPipeline();
    return await prismaClient.player.count();
}

export async function getPlayers(): Promise<PlayerListDto[]> {
    await preventPrerenderingInCiPipeline();
    const matchCount = await prismaClient.match.count();
    const players = await prismaClient.player.findMany({
        include: { _count: { select: { teamPlayer: {} } } },
    });
    return players.map((p) => mapPlayerToListDto(p, matchCount));
}

function mapPlayerToListDto(player: PlayerQueryResult, matchCount: number): PlayerListDto {
    return {
        id: player.id,
        name: player.name,
        matchCount: player._count.teamPlayer,
        matchRatio: matchCount ? (player._count.teamPlayer / matchCount) * 100.0 : 0,
        rating: ordinal({ mu: player.mu, sigma: player.sigma }),
        regular: player.regular,
    };
}

export async function getAllPlayers(date?: Date): Promise<PlayerDto[]> {
    await preventPrerenderingInCiPipeline();
    const players = await prismaClient.player.findMany({
        include: {
            teamPlayer: {
                take: 1,
                where: { team: { match: { date: { lt: date } } } },
                orderBy: { team: { match: { date: 'desc' } } },
                omit: { beforeMu: true, beforeSigma: true, id: true, playerId: true, teamId: true, weight: true },
            },
        },
        orderBy: [{ regular: 'desc' }, { name: 'asc' }],
    });
    return players.map((p) => {
        let mu = date ? DEFAULT_MU : p.mu;
        let sigma = date ? DEFAULT_SIGMA : p.sigma;
        if (date && p.teamPlayer.length) {
            mu = p.teamPlayer[0].afterMu;
            sigma = p.teamPlayer[0].afterSigma;
        }
        return {
            id: p.id,
            name: p.name,
            rating: ordinal({ mu, sigma }),
            mu,
            sigma,
            regular: p.regular,
        };
    });
}

interface CreatePlayerDto {
    name?: string;
    regular: boolean;
}

export async function createPlayer(player: CreatePlayerDto): Promise<PlayerStateDto> {
    let id: number | null = null;
    try {
        const validationResult = await createPlayerValidate(player);
        if (validationResult) {
            return validationResult;
        }
        id = await createPlayerDatabase(player);
        createPlayerCache(id);
    } catch (error) {
        return {
            globalErrors: [error instanceof ValidationError ? error.message : 'Váratlan hiba történt'],
            successful: false,
            state: { ...player },
        };
    }
    redirect(`/players/${id}`);
}

async function createPlayerValidate(player: CreatePlayerDto): Promise<PlayerStateDto | null> {
    const session = await getServerSession(authOptions);
    if (!session?.admin) {
        throw new ValidationError('Nincs jogod a létrehozáshoz');
    }

    if (!player.name?.trim()) {
        return { errors: { name: ['A név kitöltése kötelező'] }, successful: false, state: { ...player } };
    } else if (player.name?.trim()?.length > 128) {
        return {
            errors: { name: ['A név nem lehet hosszabb 128 karakternél'] },
            successful: false,
            state: { ...player },
        };
    }

    return null;
}

async function createPlayerDatabase(player: CreatePlayerDto): Promise<number> {
    const { id } = await prismaClient.player.create({
        data: { name: player.name!.trim(), regular: player.regular, mu: DEFAULT_MU, sigma: DEFAULT_SIGMA },
        omit: { name: true, mu: true, sigma: true, regular: true },
    });
    return id;
}

function createPlayerCache(id: number): void {
    revalidatePath('/players');
    revalidatePath(`/players/${id}`);
}

interface EditPlayerDto {
    id?: number;
    name?: string;
    regular: boolean;
}

export async function editPlayer(player: EditPlayerDto): Promise<PlayerStateDto> {
    try {
        const oldPlayer = await prismaClient.player.findFirst({
            where: { id: player.id },
            include: { _count: { select: { teamPlayer: {}, playerStatistic: {} } } },
            omit: { id: true, mu: true, sigma: true },
        });
        if (player.name?.trim() !== oldPlayer?.name || player.regular !== oldPlayer?.regular) {
            const validationResult = await editPlayerValidate(player, oldPlayer);
            if (validationResult) {
                return validationResult;
            }
            await editPlayerDatabase(player, oldPlayer!);
            editPlayerCache();
        }
    } catch (error) {
        return {
            globalErrors: [error instanceof ValidationError ? error.message : 'Váratlan hiba történt'],
            successful: false,
            state: { ...player },
        };
    }
    redirect(`/players/${player.id}`);
}

async function editPlayerValidate(
    player: EditPlayerDto,
    oldPlayer: EditPlayerQueryResult | null
): Promise<PlayerStateDto | null> {
    const session = await getServerSession(authOptions);
    if (!session?.admin) {
        throw new ValidationError('Nincs jogod a szerkesztéshez');
    }
    if (!oldPlayer) {
        throw new ValidationError('A játékos nem létezik');
    }

    if (!player.name?.trim()) {
        return { errors: { name: ['A név kitöltése kötelező'] }, successful: false, state: { ...player } };
    } else if (player.name?.trim()?.length > 128) {
        return {
            errors: { name: ['A név nem lehet hosszabb 128 karakternél'] },
            successful: false,
            state: { ...player },
        };
    }

    return null;
}

async function editPlayerDatabase(player: EditPlayerDto, oldPlayer: EditPlayerQueryResult): Promise<void> {
    await prismaClient.$transaction(async (pc) => {
        await pc.player.update({
            data: { name: player.name?.trim(), regular: player.regular },
            where: { id: player.id },
            omit: { mu: true, name: true, regular: true, sigma: true },
        });
        if (oldPlayer._count.playerStatistic && !player.regular) {
            await pc.playerStatistic.deleteMany({
                where: { playerId: player.id },
            });
        } else if (oldPlayer._count.teamPlayer && player.regular && !oldPlayer.regular) {
            await updatePlayerStatistics(pc, player.id!);
        }
        if ((player.regular || oldPlayer.regular) && oldPlayer._count.teamPlayer) {
            await updateGlobalStatistics(pc);
        }
    });
}

function editPlayerCache(): void {
    revalidatePath('/');
    revalidatePath('/matches');
    revalidatePath('/players');
    revalidatePath('/players/[id]', 'page');
}

interface DeletePlayerDto {
    id?: number;
    navigate: boolean;
}

export async function deletePlayer(player: DeletePlayerDto): Promise<PlayerStateDto> {
    try {
        const dbPlayer = await prismaClient.player.findFirst({
            where: { id: player.id },
            include: { _count: { select: { teamPlayer: {}, playerStatistic: {} } } },
            omit: { id: true, mu: true, name: true, sigma: true },
        });
        await deletePlayerValidate(dbPlayer);
        await deletePlayerDatabase(player, dbPlayer!);
        deletePlayerCache(player);
    } catch (error) {
        return {
            globalErrors: [error instanceof ValidationError ? error.message : 'Váratlan hiba történt'],
            successful: false,
        };
    }
    if (player.navigate) {
        redirect('/players');
    }
    return { successful: true };
}

async function deletePlayerValidate(player: DeletePlayerQueryResult | null): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.admin) {
        throw new ValidationError('Nincs jogod a törléshez');
    }
    if (!player) {
        throw new ValidationError('A játékos nem létezik');
    }
    if (player._count.teamPlayer) {
        throw new ValidationError('Csak a meccs nélküli játékosok törölhetők');
    }
}

async function deletePlayerDatabase(player: DeletePlayerDto, dbPlayer: DeletePlayerQueryResult): Promise<void> {
    await prismaClient.$transaction(async (pc) => {
        if (dbPlayer._count.playerStatistic) {
            await pc.playerStatistic.deleteMany({ where: { playerId: player.id } });
        }
        await pc.player.delete({ where: { id: player.id } });
    });
}

function deletePlayerCache(player: DeletePlayerDto): void {
    revalidatePath('/players');
    revalidatePath(`/players/${player.id}`);
}
