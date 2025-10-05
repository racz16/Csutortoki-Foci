import { PlayerStatisticsDto } from '@/dtos/player-statistics-dto';
import { StatisticDto } from '@/dtos/statistic-dto';
import { preventPrerenderingInCiPipeline } from '@/utility';
import { prismaClient } from './prisma';

interface StatisticQueryResult {
    id: number;
    name: string;
    value: string;
    details: string | null;
    extraDetails: string | null;
    extraDetailsTooltip: string | null;
}

export async function getPlayerStatistics(): Promise<PlayerStatisticsDto | null> {
    await preventPrerenderingInCiPipeline();
    const players = await prismaClient.player.findMany({
        where: { regular: true, teamPlayer: { some: {} } },
        omit: { mu: true, regular: true, sigma: true },
    });
    if (!players.length) {
        return null;
    }
    const randomPlayer = players[Math.floor(Math.random() * players.length)];
    const playerStatistics = await prismaClient.playerStatistic.findMany({
        where: { playerId: randomPlayer.id },
        orderBy: { index: 'asc' },
        omit: { playerId: true },
    });
    return {
        id: randomPlayer.id,
        name: randomPlayer.name,
        statistics: playerStatistics.map((ps) => mapStatisticToDto(ps)),
    };
}

export async function getGeneralStatistics(): Promise<StatisticDto[]> {
    await preventPrerenderingInCiPipeline();
    const globalStatistics = await prismaClient.globalStatistic.findMany({ orderBy: { index: 'asc' } });
    return globalStatistics.map((gs) => mapStatisticToDto(gs));
}

function mapStatisticToDto(statistic: StatisticQueryResult): StatisticDto {
    return {
        id: statistic.id,
        name: statistic.name,
        value: statistic.value,
        details: statistic.details,
        extraDetails: statistic.extraDetails,
        extraDetailsTooltip: statistic.extraDetailsTooltip,
    };
}
