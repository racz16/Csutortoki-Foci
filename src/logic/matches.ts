import { LocationDto } from '@/dtos/location-dto';
import { MatchDto } from '@/dtos/match-dto';
import { MatchStateDto } from '@/dtos/match-state-dto';
import { MatchesDto } from '@/dtos/matches-dto';
import { Prisma } from '@/generated/prisma';
import { DEFAULT_MU, DEFAULT_SIGMA, preventPrerenderingInCiPipeline, ValidationError } from '@/utility';
import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { ordinal, predictWin, rate, rating, Team } from 'openskill';
import prismaClient, { TPrismaClient } from './prisma';
import { updateGlobalStatistics, updatePlayerStatistics } from './statistics';
import { authOptions } from './users';

interface MatchQueryResult {
    id: number;
    date: Date;
    team: TeamQueryResult[];
    location: LocationQueryResult;
}

interface TeamQueryResult {
    score: number;
    teamPlayer: TeamPlayerQueryResult[];
}

interface TeamPlayerQueryResult {
    beforeMu: number;
    beforeSigma: number;
    afterMu: number;
    afterSigma: number;
    player: PlayerQueryResult;
    // weight: number | null;
}

interface PlayerQueryResult {
    id: number;
    name: string;
    regular: boolean;
}

interface LocationQueryResult {
    id: number;
    name: string;
}

export async function getMatches(nextDate?: Date, playerId?: number): Promise<MatchesDto> {
    await preventPrerenderingInCiPipeline();

    const pageSize = 10;
    const where = getMatchesCondition(nextDate, playerId);

    const matches = await prismaClient.match.findMany({
        where,
        orderBy: { date: 'desc' },
        take: pageSize + 1,
        include: {
            team: {
                orderBy: { id: 'asc' },
                include: {
                    teamPlayer: {
                        orderBy: [{ player: { regular: 'desc' } }, { player: { name: 'asc' } }],
                        include: { player: { omit: { mu: true, sigma: true } } },
                        omit: { id: true, playerId: true, teamId: true, weight: true },
                    },
                },
                omit: { id: true, matchId: true },
            },
            location: {},
        },
        omit: { locationId: true },
    });

    const newNextDate = matches.length === pageSize + 1 ? (matches.pop()?.date?.toString() ?? null) : null;
    return { matches: matches.map((m) => mapMatchToDto(m)), nextDate: newNextDate };
}

function getMatchesCondition(nextDate?: Date, playerId?: number): Prisma.MatchWhereInput | undefined {
    const and: Prisma.MatchWhereInput[] = [];
    if (nextDate) {
        and.push({ date: { lte: nextDate } });
    }
    if (playerId) {
        and.push({ team: { some: { teamPlayer: { some: { playerId } } } } });
    }
    return { AND: and };
}

export async function getLastMatch(): Promise<MatchDto | null> {
    await preventPrerenderingInCiPipeline();
    const match = await prismaClient.match.findFirst({
        orderBy: { date: 'desc' },
        include: {
            team: {
                orderBy: { id: 'asc' },
                include: {
                    teamPlayer: {
                        orderBy: [{ player: { regular: 'desc' } }, { player: { name: 'asc' } }],
                        include: { player: { omit: { mu: true, sigma: true } } },
                        omit: { id: true, playerId: true, teamId: true, weight: true },
                    },
                },
                omit: { id: true, matchId: true },
            },
            location: {},
        },
        omit: { locationId: true },
    });
    if (!match) {
        return null;
    }
    return mapMatchToDto(match);
}

function mapMatchToDto(match: MatchQueryResult): MatchDto {
    const predictions = computePredictions(match.team);
    return {
        id: match.id,
        date: match.date.toString(),
        location: match.location.name,
        locationId: match.location.id,
        team: match.team.map((t, ti) => ({
            score: t.score,
            chance: predictions[ti],
            teamPlayer: t.teamPlayer.map((tp) => ({
                playerId: tp.player.id,
                name: tp.player.name,
                beforeRating: ordinal({ mu: tp.beforeMu, sigma: tp.beforeSigma }),
                afterRating: ordinal({ mu: tp.afterMu, sigma: tp.afterSigma }),
                regular: tp.player.regular,
                // weight: tp.weight ?? 1,
            })),
        })),
    };
}

function computePredictions(teams: TeamQueryResult[]): number[] {
    const osTeams: Team[] = [];
    for (const team of teams) {
        const osTeam: Team = [];
        for (const teamPlayer of team.teamPlayer) {
            const osRating = rating({ mu: teamPlayer.beforeMu, sigma: teamPlayer.beforeSigma });
            osTeam.push(osRating);
        }
        osTeams.push(osTeam);
    }
    return predictWin(osTeams);
}

// #region Create

interface CreateMatchDto {
    date?: Date;
    location?: number;
    score1?: number;
    score2?: number;
    team1?: number[];
    team2?: number[];
}

export async function createMatch(match: CreateMatchDto): Promise<MatchStateDto> {
    try {
        const validationResult = await createMatchValidate(match);
        if (validationResult) {
            return validationResult;
        }
        await createMatchDatabase(match);
        createMatchCache();
    } catch (error) {
        return {
            globalErrors: [error instanceof ValidationError ? error.message : 'Váratlan hiba történt'],
            successful: false,
            state: { ...match, date: match.date?.toString() },
        };
    }
    return { successful: true };
}

async function createMatchValidate(match: CreateMatchDto): Promise<MatchStateDto | null> {
    const session = await getServerSession(authOptions);
    if (!session?.admin) {
        throw new ValidationError('Nincs jogod a létrehozáshoz');
    }
    const date = await validateDate(match.date);
    const score1 = validateScore(match.score1);
    const score2 = validateScore(match.score2);
    const location = await validateLocation(match.location);
    const team1 = await validateTeam(match.team1);
    const team2 = await validateTeam(match.team2);
    validateTeams(match.team1, match.team2);
    return date || score1 || score2 || location || team1 || team2
        ? {
              successful: false,
              errors: { date, score1, score2, location, team1, team2 },
              state: { ...match, date: match.date?.toString() },
          }
        : null;
}

async function validateDate(date?: Date, id?: number): Promise<string[] | undefined> {
    if (!date) {
        return ['A dátum kitöltése kötelező'];
    } else if (date.getDate() === 0) {
        return ['A dátum formátuma helytelen'];
    } else if (date > new Date()) {
        return ['A dátum nem lehet jövőbeli'];
    } else {
        const matchCount = await prismaClient.match.count({ where: { date, id: { not: id } } });
        if (matchCount) {
            return ['Már létezik meccs ebben az időpontban'];
        }
    }
    return undefined;
}

function validateScore(score?: number): string[] | undefined {
    if (score === undefined) {
        return ['Az eredmény kitöltése kötelező'];
    } else if (score < 0) {
        return ['Az eredmény nem lehet kisebb 0-nál'];
    } else if (score > 32767) {
        return ['Az eredmény nem lehet nagyobb 32767-nél'];
    }
    return undefined;
}

async function validateLocation(location?: number): Promise<string[] | undefined> {
    if (!location) {
        return ['A helyszín kitöltése kötelező'];
    } else {
        const locationCount = await prismaClient.location.count({ where: { id: location } });
        if (!locationCount) {
            return ['A helyszín nem létezik'];
        }
    }
    return undefined;
}

function validateTeams(team1?: number[], team2?: number[]): void {
    if (team1 && team2) {
        if (team1.some((p) => team2?.includes(p))) {
            throw new ValidationError('Ugyanaz a játékos nem lehet mindkét csapatnak a tagja');
        }
    }
}

async function validateTeam(team?: number[]): Promise<string[] | undefined> {
    const valiadtionResults: string[] = [];
    if (!team || !team.length) {
        valiadtionResults.push('A csapatban szerepelnie kell legalább 1 játékosnak');
    } else {
        if (team.length !== new Set(team).size) {
            valiadtionResults.push('Minden játékos csak egyszer szerepelhet a csapatban');
        }
        const playerCount = await prismaClient.player.count({ where: { id: { in: team } } });
        if (team.length !== playerCount) {
            valiadtionResults.push('Bizonyos játékosok nem léteznek');
        }
    }
    return valiadtionResults.length ? valiadtionResults : undefined;
}

async function createMatchDatabase(match: CreateMatchDto): Promise<void> {
    await prismaClient.$transaction(async (pc) => {
        const matchDb = await pc.match.create({
            data: {
                locationId: match.location!,
                date: match.date!,
            },
            omit: { date: true, locationId: true },
        });
        const teamsDb = await pc.team.createManyAndReturn({
            data: [
                { matchId: matchDb.id, score: match.score1! },
                { matchId: matchDb.id, score: match.score2! },
            ],
            omit: { matchId: true, score: true },
        });
        await pc.teamPlayer.createMany({
            data: [
                ...(match.team1?.map(
                    (p) =>
                        ({
                            teamId: teamsDb[0].id,
                            playerId: p,
                            beforeMu: 0,
                            beforeSigma: 0,
                            afterMu: 0,
                            afterSigma: 0,
                        }) as Prisma.TeamPlayerCreateManyInput
                ) ?? []),
                ...(match.team2?.map(
                    (p) =>
                        ({
                            teamId: teamsDb[1].id,
                            playerId: p,
                            beforeMu: 0,
                            beforeSigma: 0,
                            afterMu: 0,
                            afterSigma: 0,
                        }) as Prisma.TeamPlayerCreateManyInput
                ) ?? []),
            ],
        });

        await updateRatings(pc, match.date!);

        const playerIds = await pc.player.findMany({
            where: { regular: true, teamPlayer: { some: {} } },
            select: { id: true },
        });
        for (const { id } of playerIds) {
            await updatePlayerStatistics(pc, id);
        }
        await updateGlobalStatistics(pc);
    });
}

function createMatchCache(): void {
    revalidatePath('/');
    revalidatePath('/matches');
    revalidatePath('/players');
    revalidatePath('/players/[id]', 'page');
}

// #endregion

// #region Edit

interface EditMatchDto {
    id?: number;
    date?: Date;
    location?: number;
    score1?: number;
    score2?: number;
    team1?: number[];
    team2?: number[];
}

export async function editMatch(match: EditMatchDto): Promise<MatchStateDto> {
    try {
        const validationResult = await editMatchValidate(match);
        if (validationResult) {
            return validationResult;
        }
        await editMatchDatabase(match);
        editMatchCache();
    } catch (error) {
        return {
            globalErrors: [error instanceof ValidationError ? error.message : 'Váratlan hiba történt'],
            successful: false,
            state: { ...match, date: match.date?.toString() },
        };
    }
    return { successful: true };
}

async function editMatchValidate(match: EditMatchDto): Promise<MatchStateDto | null> {
    const session = await getServerSession(authOptions);
    if (!session?.admin) {
        throw new ValidationError('Nincs jogod a szerkesztéshez');
    }
    if (!match.id) {
        throw new ValidationError('A meccs nem létezik');
    }
    const date = await validateDate(match.date, match.id);
    const score1 = validateScore(match.score1);
    const score2 = validateScore(match.score2);
    const location = await validateLocation(match.location);
    const team1 = await validateTeam(match.team1);
    const team2 = await validateTeam(match.team2);
    validateTeams(match.team1, match.team2);
    return date || score1 || score2 || location || team1 || team2
        ? {
              successful: false,
              errors: { date, score1, score2, location, team1, team2 },
              state: { ...match, date: match.date?.toString() },
          }
        : null;
}

async function editMatchDatabase(match: EditMatchDto): Promise<void> {
    const matchDb = await prismaClient.match.findFirstOrThrow({
        include: {
            team: {
                include: { teamPlayer: { select: { id: true, playerId: true } } },
                omit: { matchId: true, score: true },
            },
        },
        where: { id: match.id },
        omit: { id: true, locationId: true },
    });
    await prismaClient.$transaction(async (pc) => {
        await pc.match.update({
            data: { date: match.date, locationId: match.location },
            where: { id: match.id },
            select: { id: true },
        });
        await pc.team.update({
            data: { score: match.score1 },
            where: { id: matchDb.team[0].id },
            select: { id: true },
        });
        await pc.team.update({
            data: { score: match.score2 },
            where: { id: matchDb.team[1].id },
            select: { id: true },
        });
        await pc.teamPlayer.deleteMany({
            where: {
                id: {
                    in: [
                        ...matchDb.team[0].teamPlayer
                            .filter((tp) => !match.team1?.includes(tp.playerId))
                            .map((tp) => tp.id),
                        ...matchDb.team[1].teamPlayer
                            .filter((tp) => !match.team2?.includes(tp.playerId))
                            .map((tp) => tp.id),
                    ],
                },
            },
        });
        await pc.teamPlayer.createMany({
            data: [
                ...(match.team1
                    ?.filter((playerId) => !matchDb.team[0].teamPlayer.map((tp) => tp.playerId).includes(playerId))
                    ?.map(
                        (playerId) =>
                            ({
                                playerId,
                                teamId: matchDb.team[0].id,
                                beforeMu: 0,
                                beforeSigma: 0,
                                afterMu: 0,
                                afterSigma: 0,
                            }) as Prisma.TeamPlayerCreateManyInput
                    ) ?? []),
                ...(match.team2
                    ?.filter((playerId) => !matchDb.team[1].teamPlayer.map((tp) => tp.playerId).includes(playerId))
                    ?.map(
                        (playerId) =>
                            ({
                                playerId,
                                teamId: matchDb.team[1].id,
                                beforeMu: 0,
                                beforeSigma: 0,
                                afterMu: 0,
                                afterSigma: 0,
                            }) as Prisma.TeamPlayerCreateManyInput
                    ) ?? []),
            ],
        });

        await updateRatings(pc, match.date! > matchDb.date ? matchDb.date : match.date!);

        const playerIds = await pc.player.findMany({
            where: { regular: true, teamPlayer: { some: {} } },
            select: { id: true },
        });
        for (const { id } of playerIds) {
            await updatePlayerStatistics(pc, id);
        }
        await updateGlobalStatistics(pc);
    });
}

function editMatchCache(): void {
    revalidatePath('/');
    revalidatePath('/matches');
    revalidatePath('/players');
    revalidatePath('/players/[id]', 'page');
}

// #endregion

// #region Delete

interface DeleteMatchDto {
    id?: number;
}

interface MatchQueryResult2 {
    date: Date;
    team: { id: number }[];
}

export async function deleteMatch(match: DeleteMatchDto): Promise<MatchStateDto> {
    try {
        const matchDb = await prismaClient.match.findFirst({
            where: { id: match.id },
            include: { team: { omit: { matchId: true, score: true } } },
            omit: { id: true, locationId: true },
        });
        await deleteMatchValidate(matchDb);
        await deleteMatchDatabase(match, matchDb!);
        deleteMatchCache();
    } catch (error) {
        return {
            globalErrors: [error instanceof ValidationError ? error.message : 'Váratlan hiba történt'],
            successful: false,
        };
    }
    return { successful: true };
}

async function deleteMatchValidate(matchDb: MatchQueryResult2 | null): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.admin) {
        throw new ValidationError('Nincs jogod a törléshez');
    }
    if (!matchDb) {
        throw new ValidationError('A meccs nem létezik');
    }
}

async function deleteMatchDatabase(match: DeleteMatchDto, matchDb: MatchQueryResult2): Promise<void> {
    await prismaClient.$transaction(async (pc) => {
        await pc.teamPlayer.deleteMany({
            where: { teamId: { in: matchDb.team.map((t) => t.id) } },
        });
        await pc.team.deleteMany({ where: { matchId: match.id } });
        await pc.match.delete({ where: { id: match.id }, omit: { date: true, locationId: true } });

        await updateRatings(pc, matchDb.date);

        const playerIds = await pc.player.findMany({
            where: { regular: true, teamPlayer: { some: {} } },
            select: { id: true },
        });
        for (const { id } of playerIds) {
            await updatePlayerStatistics(pc, id);
        }
        await updateGlobalStatistics(pc);
    });
}

function deleteMatchCache(): void {
    revalidatePath('/');
    revalidatePath('/matches');
    revalidatePath('/players');
    revalidatePath('/players/[id]', 'page');
}

//#endregion

// #region Update ratings

async function updateRatings(pc: TPrismaClient, date: Date): Promise<void> {
    const playersMap = await getPlayersMap(pc, date);
    await updateTeamPlayers(pc, date, playersMap);
    await updatePlayers(pc, playersMap);
}

async function getPlayersMap(pc: TPrismaClient, date: Date): Promise<Map<number, { mu: number; sigma: number }>> {
    const players = await pc.player.findMany({
        include: {
            teamPlayer: {
                select: { afterMu: true, afterSigma: true },
                take: 1,
                where: { team: { match: { date: { lt: date } } } },
                orderBy: { team: { match: { date: 'desc' } } },
            },
        },
        omit: { mu: true, sigma: true, name: true, regular: true },
    });
    const playersMap = new Map<number, { mu: number; sigma: number }>();
    for (const player of players) {
        const values = { mu: DEFAULT_MU, sigma: DEFAULT_SIGMA };
        if (player.teamPlayer.length > 0) {
            values.mu = player.teamPlayer[0].afterMu;
            values.sigma = player.teamPlayer[0].afterSigma;
        }
        playersMap.set(player.id, values);
    }
    return playersMap;
}

async function updateTeamPlayers(
    pc: TPrismaClient,
    date: Date,
    playersMap: Map<number, { mu: number; sigma: number }>
): Promise<void> {
    const matches = await pc.match.findMany({
        where: { date: { gte: date } },
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
                await pc.teamPlayer.update({
                    data: {
                        beforeMu: player.mu,
                        beforeSigma: player.sigma,
                        afterMu: osRating.mu,
                        afterSigma: osRating.sigma,
                    },
                    where: { id: teamPlayer.id },
                });
                player.mu = osRating.mu;
                player.sigma = osRating.sigma;
            }
        }
    }
}

interface TeamRatingQueryResult {
    score: number;
    teamPlayer: { playerId: number }[];
}

export function computeResults(
    teams: TeamRatingQueryResult[],
    playersMap: Map<number, { mu: number; sigma: number }>
): Team[] {
    const osTeams: Team[] = [];
    const osScore: number[] = [];
    // const osWeights: number[][] = [];
    for (const team of teams) {
        osScore.push(team.score);
        const osTeam: Team = [];
        // const osWeight: number[] = [];
        for (const teamPlayer of team.teamPlayer) {
            // const osRating = rating({ mu: teamPlayer.player.mu, sigma: teamPlayer.player.sigma });
            const player = playersMap.get(teamPlayer.playerId)!;
            const osRating = rating({ mu: player.mu, sigma: player.sigma });
            osTeam.push(osRating);
            // osWeight.push(teamPlayer.weight ?? 1);
        }
        osTeams.push(osTeam);
        // osWeights.push(osWeight);
    }
    return rate(osTeams, { score: osScore });
}

async function updatePlayers(pc: TPrismaClient, playersMap: Map<number, { mu: number; sigma: number }>): Promise<void> {
    for (const [id, { mu, sigma }] of playersMap) {
        await pc.player.update({
            data: { mu, sigma },
            where: { id },
        });
    }
}

//#endregion

export async function getLocations(): Promise<LocationDto[]> {
    await preventPrerenderingInCiPipeline();
    return await prismaClient.location.findMany();
}
