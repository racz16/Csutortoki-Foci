'use server';

import { revalidatePath } from 'next/cache';
import { ordinal, rate, rating, Team } from 'openskill';
import prismaClient from './logic/prisma';
import {
    GLOBAL_STATISTIC_AVERAGE_GOAL_COUNT_INDEX,
    GLOBAL_STATISTIC_AVERAGE_RATING_INDEX,
    GLOBAL_STATISTIC_BIGGEST_VICTORY_INDEX,
    GLOBAL_STATISTIC_GOAL_COUNT_INDEX,
    GLOBAL_STATISTIC_MATCH_COUNT_INDEX,
    GLOBAL_STATISTIC_MAX_GOAL_COUNT_BY_TEAM_INDEX,
    GLOBAL_STATISTIC_MAX_GOAL_COUNT_INDEX,
    GLOBAL_STATISTIC_MAX_MATCH_COUNT_BY_PLAYER_INDEX,
    GLOBAL_STATISTIC_MAX_RATING_INDEX,
    GLOBAL_STATISTIC_MIN_GOAL_COUNT_BY_TEAM_INDEX,
    GLOBAL_STATISTIC_MIN_GOAL_COUNT_INDEX,
    GLOBAL_STATISTIC_PLAYER_COUNT_INDEX,
    PLAYER_STATISTIC_DRAW_MATCH_COUNT_INDEX,
    PLAYER_STATISTIC_FORM_INDEX,
    PLAYER_STATISTIC_LOST_MATCH_COUNT_INDEX,
    PLAYER_STATISTIC_MATCH_COUNT_INDEX,
    PLAYER_STATISTIC_MATCH_RATIO_INDEX,
    PLAYER_STATISTIC_MAX_RATING_INDEX,
    PLAYER_STATISTIC_MIN_RATING_INDEX,
    PLAYER_STATISTIC_RATING_INDEX,
    PLAYER_STATISTIC_WON_MATCH_COUNT_INDEX,
} from './logic/statistics';
import { formatDate, formatNumberMaxDigits, formatNumberMinMaxDigits } from './utility';

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

interface TeamPlayerPlayerStatisticsQueryResult {
    playerId: number;
    afterMu: number;
    afterSigma: number;
}

interface PlayerStatisticUpdate {
    index: number;
    name: string;
    value: string;
    valueAriaLabel?: string | null;
    details?: string | null;
    extraDetails?: string | null;
    extraDetailsTooltip?: string | null;
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
    revalidate();
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
    revalidate();
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
    const matches = await prismaClient.match.findMany({
        where: { team: { some: { teamPlayer: { some: { playerId } } } } },
        include: {
            team: {
                include: {
                    teamPlayer: {
                        where: { playerId },
                        omit: {
                            id: true,
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
        orderBy: { date: 'desc' },
        omit: { id: true, date: true, locationId: true },
    });
    const oldStatistics = await prismaClient.playerStatistic.findMany({
        where: { playerId },
        omit: { playerId: true, details: true, extraDetails: true, extraDetailsTooltip: true, name: true, value: true },
    });

    const matchResults = matches.map((m) => {
        if (m.team[0].score == m.team[1].score) {
            return 0;
        }
        const teamIndex = m.team[0].teamPlayer.some((tp) => tp.playerId === playerId) ? 0 : 1;
        const winnerIndex = m.team[0].score > m.team[1].score ? 0 : 1;
        return teamIndex === winnerIndex ? 1 : -1;
    });
    const teamPlayers = matches.flatMap((m) => m.team.flatMap((t) => t.teamPlayer));

    const newStatistics: PlayerStatisticUpdate[] = [
        getRatingPlayerStatistic(teamPlayers),
        getMaxRatingPlayerStatistic(teamPlayers),
        getMinRatingPlayerStatistic(teamPlayers),
        getWonMatchCountPlayerStatistic(matchResults),
        getDrawMatchCountPlayerStatistic(matchResults),
        getLostMatchCountPlayerStatistic(matchResults),
        getMatchCountPlayerStatistic(teamPlayers.length),
        getMatchRatioPlayerStatistic(matchCount, teamPlayers.length),
        getFormPlayerStatistic(matchResults),
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
    revalidatePlayer(playerId);
}

function getRatingPlayerStatistic(teamPlayers: TeamPlayerPlayerStatisticsQueryResult[]): PlayerStatisticUpdate {
    const rating = teamPlayers.length ? ordinal({ mu: teamPlayers[0].afterMu, sigma: teamPlayers[0].afterSigma }) : 0;
    return {
        index: PLAYER_STATISTIC_RATING_INDEX,
        name: 'Pontszám',
        value: formatNumberMinMaxDigits(rating, 2),
        details: 'Jelenleg',
    };
}

function getMaxRatingPlayerStatistic(teamPlayers: TeamPlayerPlayerStatisticsQueryResult[]): PlayerStatisticUpdate {
    const maxRating = teamPlayers.reduce(
        (prev, curr) => Math.max(prev, ordinal({ mu: curr.afterMu, sigma: curr.afterSigma })),
        0
    );
    return {
        index: PLAYER_STATISTIC_MAX_RATING_INDEX,
        name: 'Legnagyobb pontszám',
        value: formatNumberMinMaxDigits(maxRating, 2),
        details: 'Valaha',
    };
}

function getMinRatingPlayerStatistic(teamPlayers: TeamPlayerPlayerStatisticsQueryResult[]): PlayerStatisticUpdate {
    const minRating = teamPlayers.reduce(
        (prev, curr) => Math.min(prev, ordinal({ mu: curr.afterMu, sigma: curr.afterSigma })),
        0
    );
    return {
        index: PLAYER_STATISTIC_MIN_RATING_INDEX,
        name: 'Legkisebb pontszám',
        value: formatNumberMinMaxDigits(minRating, 2),
        details: 'Valaha',
    };
}

function getWonMatchCountPlayerStatistic(matchResults: number[]): PlayerStatisticUpdate {
    return {
        index: PLAYER_STATISTIC_WON_MATCH_COUNT_INDEX,
        name: 'Győzelmek száma',
        value: matchResults.filter((mr) => mr === 1).length.toFixed(),
        details: 'Összesen',
    };
}

function getDrawMatchCountPlayerStatistic(matchResults: number[]): PlayerStatisticUpdate {
    return {
        index: PLAYER_STATISTIC_DRAW_MATCH_COUNT_INDEX,
        name: 'Döntetlenek száma',
        value: matchResults.filter((mr) => mr === 0).length.toFixed(),
        details: 'Összesen',
    };
}

function getLostMatchCountPlayerStatistic(matchResults: number[]): PlayerStatisticUpdate {
    return {
        index: PLAYER_STATISTIC_LOST_MATCH_COUNT_INDEX,
        name: 'Vereségek száma',
        value: matchResults.filter((mr) => mr === -1).length.toFixed(),
        details: 'Összesen',
    };
}

function getMatchCountPlayerStatistic(playerMatchCount: number): PlayerStatisticUpdate {
    return {
        index: PLAYER_STATISTIC_MATCH_COUNT_INDEX,
        name: 'Meccsek száma',
        value: playerMatchCount.toFixed(),
        details: 'Összesen',
    };
}

function getMatchRatioPlayerStatistic(matchCount: number, playerMatchCount: number): PlayerStatisticUpdate {
    const matchRatio = ((matchCount ? playerMatchCount / matchCount : 0) * 100).toFixed() + '%';
    return { index: PLAYER_STATISTIC_MATCH_RATIO_INDEX, name: 'Részvétel', value: matchRatio, details: 'Összesen' };
}

function getFormPlayerStatistic(matchResults: number[]): PlayerStatisticUpdate {
    const form = matchResults.length
        ? matchResults
              .slice(0, 3)
              .map((mr) => mapMatchResultToInitial(mr))
              .join(' ')
        : '-';
    return {
        index: PLAYER_STATISTIC_FORM_INDEX,
        name: 'Forma',
        value: form,
        valueAriaLabel: matchResults
            .slice(0, 3)
            .map((mr) => mapMatchResultToWord(mr))
            .join(', '),
        details: 'Az utolsó 3 meccsen',
    };
}

function mapMatchResultToWord(result: number): string {
    if (result > 0) {
        return 'győzelem';
    } else if (result < 0) {
        return 'vereség';
    } else {
        return 'döntetlen';
    }
}

function mapMatchResultToInitial(result: number): string {
    if (result > 0) {
        return 'GY';
    } else if (result < 0) {
        return 'V';
    } else {
        return 'D';
    }
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
    return {
        index: GLOBAL_STATISTIC_MATCH_COUNT_INDEX,
        value: matchCount.toFixed(),
        name: 'Meccsek száma',
        details: 'Összesen',
    };
}

function getPlayerCountGlobalStatistic(players: PlayerGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const playerCount = players.filter((p) => p._count.teamPlayer > 0).length;
    return {
        index: GLOBAL_STATISTIC_PLAYER_COUNT_INDEX,
        name: 'Játékosok száma',
        value: playerCount.toFixed(),
        details: 'Összesen',
    };
}

function getGoalCountGlobalStatistic(goalCount: number): GlobalStatisticUpdate {
    return {
        index: GLOBAL_STATISTIC_GOAL_COUNT_INDEX,
        value: goalCount.toFixed(),
        name: 'Gólok száma',
        details: 'Összesen',
    };
}

function getAverageGoalCountGlobalStatistic(matchCount: number, goalCount: number): GlobalStatisticUpdate {
    const averageGoalCount = matchCount !== 0 ? goalCount / matchCount : 0;
    return {
        index: GLOBAL_STATISTIC_AVERAGE_GOAL_COUNT_INDEX,
        value: formatNumberMaxDigits(averageGoalCount, 1),
        name: 'Átlag gólszám',
        details: 'Egy meccsen',
    };
}

function getMaxGoalCountGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const maxGoalCount = Math.max(...matches.map((m) => m.team[0].score + m.team[1].score));
    return {
        index: GLOBAL_STATISTIC_MAX_GOAL_COUNT_INDEX,
        value: maxGoalCount.toFixed(),
        name: 'Legtöbb gól',
        details: 'Egy meccsen',
    };
}

function getMinGoalCountGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const minGoalCount = Math.min(...matches.map((m) => m.team[0].score + m.team[1].score));
    return {
        index: GLOBAL_STATISTIC_MIN_GOAL_COUNT_INDEX,
        value: minGoalCount.toFixed(),
        name: 'Legkevesebb gól',
        details: 'Egy meccsen',
    };
}

function getMaxGoalCountByTeamGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const maxGoalCount = Math.max(...matches.flatMap((m) => m.team.map((t) => t.score)));
    return {
        index: GLOBAL_STATISTIC_MAX_GOAL_COUNT_BY_TEAM_INDEX,
        value: maxGoalCount.toFixed(),
        name: 'Legtöbb gól',
        details: 'Egy csapat által',
    };
}

function getMinGoalCountByTeamGlobalStatistic(matches: MatchGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const minGoalCount = Math.min(...matches.flatMap((m) => m.team.map((t) => t.score)));
    return {
        index: GLOBAL_STATISTIC_MIN_GOAL_COUNT_BY_TEAM_INDEX,
        value: minGoalCount.toFixed(),
        name: 'Legkevesebb gól',
        details: 'Egy csapat által',
    };
}

function getMaxMatchCountByPlayerGlobalStatistic(players: PlayerGlobalStatisticsQueryResult[]): GlobalStatisticUpdate {
    const maxMatchCount = players.reduce((prev, curr) => Math.max(prev, curr._count.teamPlayer), 0);
    const maxMatchCountPlayers = players
        .filter((p) => p._count.teamPlayer === maxMatchCount)
        .map((p) => p.name)
        .sort();
    return {
        index: GLOBAL_STATISTIC_MAX_MATCH_COUNT_BY_PLAYER_INDEX,
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
            index: GLOBAL_STATISTIC_BIGGEST_VICTORY_INDEX,
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
        index: GLOBAL_STATISTIC_BIGGEST_VICTORY_INDEX,
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
    }, 0);
    const bestPlayers = players
        .filter((p) => ordinal({ mu: p.mu, sigma: p.sigma }) === maxRating)
        .map((p) => p.name)
        .sort();
    return {
        index: GLOBAL_STATISTIC_MAX_RATING_INDEX,
        value: formatNumberMinMaxDigits(maxRating, 2),
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
        index: GLOBAL_STATISTIC_AVERAGE_RATING_INDEX,
        name: 'Átlag pontszám',
        value: formatNumberMinMaxDigits(averageRating, 2),
        details: 'Összesen',
    };
}

function revalidate(): void {
    revalidatePath('/');
    revalidatePath('/matches');
    revalidatePath('/players');
}

function revalidatePlayer(playerId: number): void {
    revalidatePath(`/players/${playerId}`);
}
