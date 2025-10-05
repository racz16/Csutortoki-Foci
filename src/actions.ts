'use server';

import { ordinal, rate, rating, Team } from 'openskill';
import { prismaClient } from './logic/prisma';
import { formatDate, formatNumberMaxDigits } from './utility';

interface TeamRatingQueryResult {
    score: number;
    teamPlayer: TeamPlayerRatingQueryResult[];
}

interface TeamPlayerRatingQueryResult {
    id: number;
    player: PlayerRatingQueryResult;
    // weight: number | null;
}

interface PlayerRatingQueryResult {
    id: number;
    mu: number;
    sigma: number;
}

interface PlayerPlayerStatisticsQueryResult {
    mu: number;
    sigma: number;
}

interface MatchePlayerStatisticsQueryResult {
    team: TeamPlayerStatisticsQueryResult[];
}

interface TeamPlayerStatisticsQueryResult {
    score: number;
    teamPlayer: TeamPlayerPlayerStatisticsQueryResult[];
}

interface TeamPlayerPlayerStatisticsQueryResult {
    playerId: number;
}

interface PlayerStatisticUpdate {
    index: number;
    name: string;
    value: string;
}

interface MatchGlobalStatisticsQueryResult {
    date: Date;
    team: TeamGlobalStatisticsQueryResult[];
}

interface TeamGlobalStatisticsQueryResult {
    score: number;
}

interface PlayerGlobalStatisticsQueryResult {
    name: string;
    mu: number;
    sigma: number;
    _count: { teamPlayer: number };
}

interface GlobalStatisticUpdate {
    index: number;
    name: string;
    value: string;
    details?: string | null;
    extraDetails?: string | null;
    extraDetailsTooltip?: string | null;
}

export async function updateAll(): Promise<void> {
    await init();
    const matches = await prismaClient.match.findMany({
        orderBy: { date: 'asc' },
        omit: { date: true, locationId: true },
    });
    for (const match of matches) {
        await update(match.id);
    }
}

async function init(): Promise<void> {
    await prismaClient.player.updateMany({
        data: {
            mu: 25.0,
            sigma: 25.0 / 3.0,
        },
    });
    await prismaClient.teamPlayer.updateMany({
        data: {
            beforeMu: 25.0,
            beforeSigma: 25.0 / 3.0,
            afterMu: 25.0,
            afterSigma: 25.0 / 3.0,
        },
    });
}

export async function updateLast(): Promise<void> {
    const match = await prismaClient.match.findFirst({
        orderBy: { date: 'desc' },
        omit: { date: true, locationId: true },
    });
    if (match) {
        await update(match.id);
    }
}

async function update(matchId: number): Promise<void> {
    const teams = await prismaClient.team.findMany({
        where: { matchId },
        include: {
            teamPlayer: {
                include: { player: { omit: { name: true } } },
                omit: {
                    afterMu: true,
                    afterSigma: true,
                    beforeMu: true,
                    beforeSigma: true,
                    playerId: true,
                    teamId: true,
                    weight: true,
                },
            },
        },
        omit: { id: true, matchId: true },
    });
    await updateRatings(teams);
    for (const team of teams) {
        for (const teamPlayer of team.teamPlayer) {
            if (teamPlayer.player.regular) {
                await updatePlayerStatistics(teamPlayer.player.id);
            }
        }
    }
    await updateGlobalStatistics();
}

async function updateRatings(teams: TeamRatingQueryResult[]): Promise<void> {
    const osResults = computeResults(teams);
    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const osTeam = osResults[i];
        for (let j = 0; j < team.teamPlayer.length; j++) {
            const teamPlayer = team.teamPlayer[j];
            const osRating = osTeam[j];
            await prismaClient.teamPlayer.update({
                data: {
                    beforeMu: teamPlayer.player.mu,
                    beforeSigma: teamPlayer.player.sigma,
                    afterMu: osRating.mu,
                    afterSigma: osRating.sigma,
                },
                where: { id: teamPlayer.id },
            });
            await prismaClient.player.update({
                data: { mu: osRating.mu, sigma: osRating.sigma },
                where: { id: teamPlayer.player.id },
            });
        }
    }
}

function computeResults(teams: TeamRatingQueryResult[]): Team[] {
    const osTeams: Team[] = [];
    const osScore: number[] = [];
    // const osWeights: number[][] = [];
    for (const team of teams) {
        osScore.push(team.score);
        const osTeam: Team = [];
        // const osWeight: number[] = [];
        for (const teamPlayer of team.teamPlayer) {
            const osRating = rating({ mu: teamPlayer.player.mu, sigma: teamPlayer.player.sigma });
            osTeam.push(osRating);
            // osWeight.push(teamPlayer.weight ?? 1);
        }
        osTeams.push(osTeam);
        // osWeights.push(osWeight);
    }
    return rate(osTeams, { score: osScore });
}

async function updatePlayerStatistics(playerId: number): Promise<void> {
    const matchCount = await prismaClient.match.count();
    const player = await prismaClient.player.findFirstOrThrow({
        where: { id: playerId },
        include: { _count: { select: { teamPlayer: {} } } },
        omit: { id: true, name: true, regular: true },
    });
    const lastMatches = await prismaClient.match.findMany({
        where: { team: { some: { teamPlayer: { some: { playerId } } } } },
        include: {
            team: {
                include: {
                    teamPlayer: {
                        where: { playerId },
                        omit: {
                            id: true,
                            afterMu: true,
                            afterSigma: true,
                            beforeMu: true,
                            beforeSigma: true,
                            teamId: true,
                            weight: true,
                        },
                    },
                },
                omit: { id: true, matchId: true },
            },
        },
        take: 3,
        orderBy: { date: 'desc' },
        omit: { id: true, date: true, locationId: true },
    });
    const oldStatistics = await prismaClient.playerStatistic.findMany({
        where: { playerId },
        omit: { playerId: true, details: true, extraDetails: true, extraDetailsTooltip: true, name: true, value: true },
    });

    const newStatistics: PlayerStatisticUpdate[] = [
        getRatingPlayerStatistic(player),
        getFormPlayerStatistic(playerId, lastMatches),
        getMatchCountPlayerStatistic(player._count.teamPlayer),
        getMatchRatioPlayerStatistic(matchCount, player._count.teamPlayer),
    ];

    for (const newStatistic of newStatistics) {
        const oldStatistic = oldStatistics.find((ps) => ps.index === newStatistic.index);
        if (oldStatistic) {
            await prismaClient.playerStatistic.update({
                data: newStatistic,
                where: { id: oldStatistic.id },
            });
        } else {
            await prismaClient.playerStatistic.create({ data: { playerId, ...newStatistic } });
        }
    }
}

function getRatingPlayerStatistic(player: PlayerPlayerStatisticsQueryResult): PlayerStatisticUpdate {
    const rating = ordinal({ mu: player.mu, sigma: player.sigma });
    return { index: 1, name: 'Pontszám', value: formatNumberMaxDigits(rating, 2) };
}

function getFormPlayerStatistic(
    playerId: number,
    lastMatches: MatchePlayerStatisticsQueryResult[]
): PlayerStatisticUpdate {
    const matchResults = lastMatches.map((m) => {
        if (m.team[0].score == m.team[1].score) {
            return 'D';
        }
        const teamIndex = m.team[0].teamPlayer.some((tp) => tp.playerId === playerId) ? 0 : 1;
        const winnerIndex = m.team[0].score > m.team[1].score ? 0 : 1;
        return teamIndex === winnerIndex ? 'GY' : 'V';
    });
    const form = matchResults.length ? matchResults.join(' ') : '-';
    return { index: 2, name: 'Forma', value: form };
}

function getMatchCountPlayerStatistic(playerMatchCount: number): PlayerStatisticUpdate {
    return { index: 3, name: 'Meccsek száma', value: playerMatchCount.toFixed() };
}

function getMatchRatioPlayerStatistic(matchCount: number, playerMatchCount: number): PlayerStatisticUpdate {
    const matchRatio = ((matchCount ? playerMatchCount / matchCount : 0) * 100).toFixed() + '%';
    return { index: 4, name: 'Részvétel', value: matchRatio };
}

async function updateGlobalStatistics(): Promise<void> {
    const matches = await prismaClient.match.findMany({
        omit: { id: true, locationId: true },
        include: {
            team: {
                omit: { id: true, matchId: true },
            },
        },
    });
    if (!matches.length) {
        return;
    }
    const players = await prismaClient.player.findMany({
        omit: { id: true, regular: true },
        where: { regular: true },
        include: { _count: { select: { teamPlayer: {} } } },
    });
    if (!players.length) {
        return;
    }

    const oldStatistics = await prismaClient.globalStatistic.findMany({
        omit: { details: true, extraDetails: true, extraDetailsTooltip: true, name: true, value: true },
    });

    const matchCount = matches.length;
    const goalCount = matches.flatMap((m) => m.team.map((t) => t.score)).reduce((prev, curr) => prev + curr, 0);

    const newStatistics: GlobalStatisticUpdate[] = [
        getMatchCountGlobalStatistic(matchCount),
        getPlayerCountGlobalStatistic(players),
        getGoalCountGlobalStatistic(goalCount),
        getAverageGoalCountGlobalStatistic(matchCount, goalCount),
        getMaxGoalCountGlobalStatistic(matches),
        getMinGoalCountGlobalStatistic(matches),
        getMaxGoalCountByTeamGlobalStatistic(matches),
        getMinGoalCountByTeamGlobalStatistic(matches),
        getMaxMatchCountByPlayerGlobalStatistic(players),
        getBiggestVictoryGlobalStatistic(matches),
        getMaxRatingGlobalStatistic(players),
        getAverageRatingGlobalStatistic(players),
    ];

    for (const newStatistic of newStatistics) {
        const oldStatistic = oldStatistics.find((ps) => ps.index === newStatistic.index);
        if (oldStatistic) {
            await prismaClient.globalStatistic.update({
                data: newStatistic,
                where: { id: oldStatistic.id },
            });
        } else {
            await prismaClient.globalStatistic.create({ data: newStatistic });
        }
    }
}

function getMatchCountGlobalStatistic(matchCount: number): GlobalStatisticUpdate {
    return { index: 1, value: matchCount.toFixed(), name: 'Meccsek száma', details: 'Összesen' };
}

function getPlayerCountGlobalStatistic(players: PlayerGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const playerCount = players.filter((p) => p._count.teamPlayer > 0).length;
    return { index: 2, name: 'Játékosok száma', value: playerCount.toFixed(), details: 'Összesen' };
}

function getGoalCountGlobalStatistic(goalCount: number): GlobalStatisticUpdate {
    return { index: 3, value: goalCount.toFixed(), name: 'Gólok száma', details: 'Összesen' };
}

function getAverageGoalCountGlobalStatistic(matchCount: number, goalCount: number): GlobalStatisticUpdate {
    const averageGoalCount = matchCount !== 0 ? goalCount / matchCount : 0;
    return {
        index: 4,
        value: formatNumberMaxDigits(averageGoalCount, 1),
        name: 'Átlag gólszám',
        details: 'Egy meccsen',
    };
}

function getMaxGoalCountGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const maxGoalCount = Math.max(...matches.map((m) => m.team[0].score + m.team[1].score));
    return { index: 5, value: maxGoalCount.toFixed(), name: 'Legtöbb gól', details: 'Egy meccsen' };
}

function getMinGoalCountGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const minGoalCount = Math.min(...matches.map((m) => m.team[0].score + m.team[1].score));
    return { index: 6, value: minGoalCount.toFixed(), name: 'Legkevesebb gól', details: 'Egy meccsen' };
}

function getMaxGoalCountByTeamGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const maxGoalCount = Math.max(...matches.flatMap((m) => m.team.map((t) => t.score)));
    return { index: 7, value: maxGoalCount.toFixed(), name: 'Legtöbb gól', details: 'Egy csapat által' };
}

function getMinGoalCountByTeamGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const minGoalCount = Math.min(...matches.flatMap((m) => m.team.map((t) => t.score)));
    return { index: 8, value: minGoalCount.toFixed(), name: 'Legkevesebb gól', details: 'Egy csapat által' };
}

function getMaxMatchCountByPlayerGlobalStatistic(players: PlayerGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const maxMatchCount = players.reduce((prev, curr) => Math.max(prev, curr._count.teamPlayer), 0);
    const maxMatchCountPlayers = players
        .filter((p) => p._count.teamPlayer === maxMatchCount)
        .map((p) => p.name)
        .sort();
    return {
        index: 9,
        value: maxMatchCount.toFixed(),
        name: 'Legtöbb meccs',
        details: maxMatchCountPlayers[0],
        extraDetails: maxMatchCountPlayers.length > 1 ? `+${maxMatchCountPlayers.length - 1}` : null,
        extraDetailsTooltip: maxMatchCountPlayers.length > 1 ? maxMatchCountPlayers.slice(1).join(', ') : null,
    };
}

function getBiggestVictoryGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const biggestVictory = matches.reduce(
        (prev, curr) =>
            Math.abs(prev.team[0].score - prev.team[1].score) > Math.abs(curr.team[0].score - curr.team[1].score)
                ? prev
                : curr,
        { team: [{ score: 0 }, { score: 0 }], date: new Date() }
    );
    if (biggestVictory.team[0].score === biggestVictory.team[1].score) {
        return {
            index: 10,
            value: '-',
            name: 'Legnagyobb győzelem',
            details: null,
            extraDetails: null,
            extraDetailsTooltip: null,
        };
    }
    const biggestVictoryDates = matches
        .filter(
            (m) =>
                Math.abs(m.team[0].score - m.team[1].score) ===
                Math.abs(biggestVictory.team[0].score - biggestVictory.team[1].score)
        )
        .map((m) => m.date)
        .sort();
    return {
        index: 10,
        value: `${biggestVictory.team[0].score} - ${biggestVictory.team[1].score}`,
        name: 'Legnagyobb győzelem',
        details: formatDate(biggestVictoryDates[0]),
        extraDetails: biggestVictoryDates.length > 1 ? `+${biggestVictoryDates.length - 1}` : null,
        extraDetailsTooltip:
            biggestVictoryDates.length > 1
                ? biggestVictoryDates
                      .slice(1)
                      .map((date) => formatDate(date))
                      .join(', ')
                : null,
    };
}

function getMaxRatingGlobalStatistic(players: PlayerGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const maxRating = players.reduce((prev, curr) => {
        const rating = ordinal({ mu: curr.mu, sigma: curr.sigma });
        return Math.max(prev, rating);
    }, Number.NEGATIVE_INFINITY);
    const bestPlayers = players
        .filter((p) => ordinal({ mu: p.mu, sigma: p.sigma }) === maxRating)
        .map((p) => p.name)
        .sort();
    return {
        index: 11,
        value: formatNumberMaxDigits(maxRating, 2),
        name: 'Legnagyobb pontszám',
        details: bestPlayers[0],
        extraDetails: bestPlayers.length > 1 ? `+${bestPlayers.length - 1}` : null,
        extraDetailsTooltip: bestPlayers.length > 1 ? bestPlayers.slice(1).join(', ') : null,
    };
}

function getAverageRatingGlobalStatistic(players: PlayerGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const averageRating = players.length
        ? players.reduce((prev, curr) => prev + ordinal({ mu: curr.mu, sigma: curr.sigma }), 0) / players.length
        : 0;
    return {
        index: 12,
        name: 'Átlag pontszám',
        value: formatNumberMaxDigits(averageRating, 2),
        details: 'Összesen',
    };
}
