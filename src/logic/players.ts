import { PlayerDevelopmentDto } from '@/dtos/player-development-dto';
import { PlayerDto } from '@/dtos/player-dto';
import { PlayerListDto } from '@/dtos/player-list-dto';
import { PlayerStateDto } from '@/dtos/player-state-dto';
import { DEFAULT_MU, DEFAULT_SIGMA, preventPrerenderingInCiPipeline, sortPlayers, ValidationError } from '@/utility';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ordinal } from 'openskill';
import { computeResults } from './matches';
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

export async function getAllPlayers(date?: Date, matchId?: number): Promise<PlayerDto[]> {
    await preventPrerenderingInCiPipeline();

    const originalDate = await getOriginalDate(matchId);
    const lowerDate = date && originalDate ? (date < originalDate ? date : originalDate) : date || originalDate;
    const playersMap = await getPlayersMap(lowerDate, matchId);
    await updateTeamPlayers(playersMap, date, originalDate);

    return Array.from(playersMap.values())
        .map((player) => ({
            id: player.id,
            name: player.name,
            rating: ordinal({ mu: player.mu, sigma: player.sigma }),
            mu: player.mu,
            sigma: player.sigma,
            regular: player.regular,
        }))
        .sort(sortPlayers);
}

async function getOriginalDate(matchId?: number): Promise<Date | undefined> {
    if (!matchId) {
        return undefined;
    }
    const originalMatch = await prismaClient.match.findFirstOrThrow({ where: { id: matchId }, select: { date: true } });
    return originalMatch?.date;
}

async function getPlayersMap(
    date?: Date,
    matchId?: number
): Promise<Map<number, { id: number; name: string; regular: boolean; mu: number; sigma: number }>> {
    const players = await prismaClient.player.findMany({
        include: {
            teamPlayer: {
                take: 1,
                where: { team: { match: { date: { lt: date }, NOT: { id: matchId } } } },
                orderBy: { team: { match: { date: 'desc' } } },
                omit: { beforeMu: true, beforeSigma: true, id: true, playerId: true, teamId: true, weight: true },
            },
        },
        omit: { mu: true, sigma: true },
    });
    const playersMap = new Map<number, { id: number; name: string; regular: boolean; mu: number; sigma: number }>();
    for (const player of players) {
        const values = {
            id: player.id,
            name: player.name,
            regular: player.regular,
            mu: DEFAULT_MU,
            sigma: DEFAULT_SIGMA,
        };
        if (player.teamPlayer.length > 0) {
            values.mu = player.teamPlayer[0].afterMu;
            values.sigma = player.teamPlayer[0].afterSigma;
        }
        playersMap.set(player.id, values);
    }
    return playersMap;
}

async function updateTeamPlayers(
    playersMap: Map<number, { mu: number; sigma: number }>,
    date?: Date,
    originalDate?: Date
): Promise<void> {
    if (!date || !originalDate || date <= originalDate) {
        return;
    }

    const matches = await prismaClient.match.findMany({
        where: { date: { lte: date, gt: originalDate } },
        orderBy: { date: 'asc' },
        include: {
            team: {
                include: { teamPlayer: { select: { id: true, playerId: true } } },
                omit: { id: true, matchId: true },
            },
        },
        omit: { id: true, date: true, locationId: true },
    });
    for (const match of matches) {
        const osResults = computeResults(match.team, playersMap);
        for (let teamIndex = 0; teamIndex < match.team.length; teamIndex++) {
            const team = match.team[teamIndex];
            const osTeam = osResults[teamIndex];
            for (let playerIndex = 0; playerIndex < team.teamPlayer.length; playerIndex++) {
                const teamPlayer = team.teamPlayer[playerIndex];
                const osRating = osTeam[playerIndex];
                const player = playersMap.get(teamPlayer.playerId)!;
                player.mu = osRating.mu;
                player.sigma = osRating.sigma;
            }
        }
    }
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
    revalidatePath('/matches');
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
    revalidatePath('/matches');
    revalidatePath('/players');
    revalidatePath(`/players/${player.id}`);
}

export async function getPlayerDevelopment(playerId: number): Promise<PlayerDevelopmentDto[]> {
    await preventPrerenderingInCiPipeline();

    const results = await prismaClient.match.findMany({
        orderBy: { date: 'asc' },
        include: {
            team: {
                include: {
                    teamPlayer: {
                        where: { playerId },
                        omit: {
                            id: true,
                            beforeMu: true,
                            beforeSigma: true,
                            playerId: true,
                            teamId: true,
                            weight: true,
                        },
                    },
                },
                omit: { id: true, matchId: true },
            },
        },
        where: { team: { some: { teamPlayer: { some: { playerId } } } } },
        omit: { id: true, locationId: true },
    });

    if (!results.length) {
        return [];
    }

    const oenDayInMs = 1000 * 60 * 60 * 24;
    return [
        { rating: 0, date: new Date(results[0].date.getTime() - oenDayInMs) },
        ...results.map((x) => {
            const teamIndex = x.team[0].teamPlayer.length ? 0 : 1;
            const teamPlayer = x.team[teamIndex].teamPlayer[0];
            return {
                date: x.date,
                score1: x.team[0].score,
                score2: x.team[1].score,
                result: Math.sign(x.team[teamIndex].score - x.team[1 - teamIndex].score),
                rating: ordinal({ mu: teamPlayer.afterMu, sigma: teamPlayer.afterSigma }),
            };
        }),
    ];
}
