import { PlayerStatisticsDto } from '@/dtos/player-statistics-dto';
import { StatisticDto } from '@/dtos/statistic-dto';
import { preventPrerenderingInCiPipeline } from '@/utility';
import prismaClient from './prisma';

interface StatisticQueryResult {
    id: number;
    name: string;
    value: string;
    valueAriaLabel: string | null;
    details: string | null;
    extraDetails: string | null;
    extraDetailsTooltip: string | null;
}

export const PLAYER_STATISTIC_RATING_INDEX = 1;
export const PLAYER_STATISTIC_MAX_RATING_INDEX = 2;
export const PLAYER_STATISTIC_MIN_RATING_INDEX = 3;
export const PLAYER_STATISTIC_WON_MATCH_COUNT_INDEX = 4;
export const PLAYER_STATISTIC_DRAW_MATCH_COUNT_INDEX = 5;
export const PLAYER_STATISTIC_LOST_MATCH_COUNT_INDEX = 6;
export const PLAYER_STATISTIC_MATCH_COUNT_INDEX = 7;
export const PLAYER_STATISTIC_MATCH_RATIO_INDEX = 8;
export const PLAYER_STATISTIC_FORM_INDEX = 9;

export const GLOBAL_STATISTIC_MATCH_COUNT_INDEX = 1;
export const GLOBAL_STATISTIC_PLAYER_COUNT_INDEX = 2;
export const GLOBAL_STATISTIC_GOAL_COUNT_INDEX = 3;
export const GLOBAL_STATISTIC_AVERAGE_GOAL_COUNT_INDEX = 4;
export const GLOBAL_STATISTIC_MAX_GOAL_COUNT_INDEX = 5;
export const GLOBAL_STATISTIC_MIN_GOAL_COUNT_INDEX = 6;
export const GLOBAL_STATISTIC_MAX_GOAL_COUNT_BY_TEAM_INDEX = 7;
export const GLOBAL_STATISTIC_MIN_GOAL_COUNT_BY_TEAM_INDEX = 8;
export const GLOBAL_STATISTIC_MAX_MATCH_COUNT_BY_PLAYER_INDEX = 9;
export const GLOBAL_STATISTIC_BIGGEST_VICTORY_INDEX = 10;
export const GLOBAL_STATISTIC_MAX_RATING_INDEX = 11;
export const GLOBAL_STATISTIC_AVERAGE_RATING_INDEX = 12;

export async function getRandomPlayerStatistics(): Promise<PlayerStatisticsDto | null> {
    await preventPrerenderingInCiPipeline();
    const players = await prismaClient.player.findMany({
        where: { regular: true, teamPlayer: { some: {} } },
        include: { _count: { select: { teamPlayer: {} } } },
        omit: { mu: true, sigma: true },
    });
    if (!players.length) {
        return null;
    }
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const playerStatistics = await prismaClient.playerStatistic.findMany({
        where: {
            playerId: randomPlayer.id,
            index: {
                in: [PLAYER_STATISTIC_RATING_INDEX, PLAYER_STATISTIC_MATCH_RATIO_INDEX, PLAYER_STATISTIC_FORM_INDEX],
            },
        },
        orderBy: { index: 'asc' },
        omit: { playerId: true, index: true },
    });
    return {
        id: randomPlayer.id,
        name: randomPlayer.name,
        matchCount: randomPlayer._count.teamPlayer,
        regular: randomPlayer.regular,
        statistics: playerStatistics.map((ps) => mapStatisticToDto(ps)),
    };
}

export async function getPlayerStatistics(playerId: number): Promise<PlayerStatisticsDto> {
    await preventPrerenderingInCiPipeline();
    const player = await prismaClient.player.findFirstOrThrow({
        where: { id: playerId },
        include: { _count: { select: { teamPlayer: {} } } },
        omit: { mu: true, sigma: true, id: true },
    });
    const playerStatistics = await prismaClient.playerStatistic.findMany({
        where: { playerId },
        orderBy: { index: 'asc' },
        omit: { playerId: true, index: true },
    });
    return {
        id: playerId,
        name: player.name,
        matchCount: player._count.teamPlayer,
        regular: player.regular,
        statistics: playerStatistics.map((ps) => mapStatisticToDto(ps)),
    };
}

export async function getGeneralStatistics(): Promise<StatisticDto[]> {
    await preventPrerenderingInCiPipeline();
    const globalStatistics = await prismaClient.globalStatistic.findMany({ orderBy: { index: 'asc' } });
    return globalStatistics.map((gs) => mapStatisticToDto({ ...gs, valueAriaLabel: null }));
}

function mapStatisticToDto(statistic: StatisticQueryResult): StatisticDto {
    return {
        id: statistic.id,
        name: statistic.name,
        value: statistic.value,
        valueAriaLabel: statistic.valueAriaLabel,
        details: statistic.details,
        extraDetails: statistic.extraDetails,
        extraDetailsTooltip: statistic.extraDetailsTooltip,
    };
}
