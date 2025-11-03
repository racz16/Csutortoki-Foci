import { CreatePlayerDto } from '@/dtos/create-player-dto';
import { DeletePlayerDto } from '@/dtos/delete-player-dto';
import { EditPlayerDto } from '@/dtos/edit-player-dto';
import { PlayerListDto } from '@/dtos/player-list-dto';
import { PlayerStateDto } from '@/dtos/player-state-dto';
import { preventPrerenderingInCiPipeline, ValidationError } from '@/utility';
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

export async function createPlayer(player: CreatePlayerDto): Promise<PlayerStateDto | null> {
    let id: number | null = null;
    try {
        const validationResult = await createPlayerValidate(player);
        if (validationResult) {
            return validationResult;
        }
        id = await createPlayerDatabase(player);
        createPlayerCache(id);
    } catch (error) {
        if (error instanceof ValidationError) {
            return { globalErrors: [error.message] };
        } else {
            return { globalErrors: ['Váratlan hiba történt'] };
        }
    }
    redirect(`/players/${id}`);
    return null;
}

async function createPlayerValidate(player: CreatePlayerDto): Promise<PlayerStateDto | null> {
    const session = await getServerSession(authOptions);
    if (!session?.admin) {
        throw new ValidationError('Nincs jogod a létrehozáshoz');
    }

    if (!player.name) {
        return {
            errors: { name: ['A név kitöltése kötelező'] },
        };
    } else if (player.name.length > 128) {
        return { errors: { name: ['A név nem lehet hosszabb 128 karakternél'] } };
    }

    return null;
}

async function createPlayerDatabase(player: CreatePlayerDto): Promise<number> {
    const { id } = await prismaClient.player.create({
        data: { name: player.name, regular: player.regular, mu: 25, sigma: 25 / 3 },
        omit: { name: true, mu: true, sigma: true, regular: true },
    });
    return id;
}

function createPlayerCache(id: number): void {
    revalidatePath('/players');
    revalidatePath(`/players/${id}`);
}

export async function editPlayer(player: EditPlayerDto): Promise<PlayerStateDto | null> {
    try {
        const oldPlayer = await prismaClient.player.findFirst({
            where: { id: player.id },
            include: { _count: { select: { teamPlayer: {}, playerStatistic: {} } } },
            omit: { id: true, mu: true, sigma: true },
        });
        if (oldPlayer && player.name === oldPlayer.name && player.regular === oldPlayer.regular) {
            return null;
        }
        const validationResult = await editPlayerValidate(player, oldPlayer);
        if (validationResult) {
            return validationResult;
        }
        await editPlayerDatabase(player, oldPlayer!);
        editPlayerCache();
    } catch (error) {
        if (error instanceof ValidationError) {
            return { globalErrors: [error.message] };
        } else {
            return { globalErrors: ['Váratlan hiba történt'] };
        }
    }
    redirect(`/players/${player.id}`);
    return null;
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

    if (!player.name) {
        return {
            errors: { name: ['A név kitöltése kötelező'] },
        };
    } else if (player.name.length > 128) {
        return { errors: { name: ['A név nem lehet hosszabb 128 karakternél'] } };
    }

    return null;
}

async function editPlayerDatabase(player: EditPlayerDto, oldPlayer: EditPlayerQueryResult): Promise<void> {
    await prismaClient.player.update({
        data: { name: player.name, regular: player.regular },
        where: { id: player.id },
        omit: { mu: true, name: true, regular: true, sigma: true },
    });
    if (oldPlayer._count.playerStatistic && !player.regular) {
        await prismaClient.playerStatistic.deleteMany({
            where: { playerId: player.id },
        });
    } else if (oldPlayer._count.teamPlayer && player.regular && !oldPlayer.regular) {
        await updatePlayerStatistics(player.id);
    }
    if ((player.regular || oldPlayer.regular) && oldPlayer._count.teamPlayer) {
        await updateGlobalStatistics();
    }
}

function editPlayerCache(): void {
    revalidatePath('/');
    revalidatePath('/matches');
    revalidatePath('/players');
    revalidatePath('/players/[id]', 'page');
}

export async function deletePlayer(dto: DeletePlayerDto): Promise<PlayerStateDto | null> {
    try {
        const player = await prismaClient.player.findFirst({
            where: { id: dto.id },
            include: { _count: { select: { teamPlayer: {}, playerStatistic: {} } } },
            omit: { id: true, mu: true, name: true, sigma: true },
        });
        await deletePlayerValidate(player);
        await deletePlayerDatabase(dto, player!);
        deletePlayerCache(dto);
    } catch (error) {
        if (error instanceof ValidationError) {
            return { globalErrors: [error.message] };
        } else {
            return { globalErrors: ['Váratlan hiba történt'] };
        }
    }
    if (dto.navigate) {
        redirect('/players');
    }
    return null;
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

async function deletePlayerDatabase(dto: DeletePlayerDto, player: DeletePlayerQueryResult): Promise<void> {
    if (player._count.playerStatistic) {
        await prismaClient.playerStatistic.deleteMany({ where: { playerId: dto.id } });
    }
    await prismaClient.player.delete({ where: { id: dto.id } });
}

function deletePlayerCache(dto: DeletePlayerDto): void {
    revalidatePath('/players');
    revalidatePath(`/players/${dto.id}`);
}
