import { PlayerStatisticsDto } from '@/dtos/player-statistics-dto';
import { StatisticDto } from '@/dtos/statistic-dto';
import { formatDate, formatNumberMaxDigits, preventPrerenderingInCiPipeline } from '@/utility';
import { ordinal } from 'openskill';
import { prismaClient } from './prisma';

export async function getPlayerStatistics(): Promise<PlayerStatisticsDto | null> {
    await preventPrerenderingInCiPipeline();
    const matchCount = await prismaClient.match.count();
    const playerCount = await prismaClient.player.count({ where: { regular: true } });
    if (!playerCount) {
        return null;
    }
    const player = await prismaClient.player.findFirstOrThrow({
        where: { regular: true },
        skip: Math.floor(Math.random() * playerCount),
        take: 1,
        include: { _count: { select: { teamPlayer: {} } } },
    });
    const lastMatches = await prismaClient.match.findMany({
        omit: { id: true, date: true },
        where: { team: { some: { teamPlayer: { some: { playerId: player.id } } } } },
        include: {
            team: {
                include: {
                    teamPlayer: {
                        omit: {
                            id: true,
                            afterMu: true,
                            afterSigma: true,
                            beforeMu: true,
                            beforeSigma: true,
                            teamId: true,
                        },
                    },
                },
                omit: { id: true, matchId: true },
            },
        },
        take: 3,
        orderBy: { date: 'desc' },
    });

    const statistics: StatisticDto[] = [];
    const result: PlayerStatisticsDto = { id: player.id, name: player.name, statistics };

    const rating = ordinal({ mu: player.mu, sigma: player.sigma });
    const matchResults = lastMatches.map((m) => {
        const teamIndex = m.team[0].teamPlayer.some((tp) => tp.playerId === player.id) ? 0 : 1;
        if (m.team[0].score == m.team[1].score) {
            return 'D';
        }
        const winnerIndex = m.team[0].score > m.team[1].score ? 0 : 1;
        return teamIndex === winnerIndex ? 'GY' : 'V';
    });

    statistics.push({ id: 1, name: 'Pontszám', value: formatNumberMaxDigits(rating, 2) });
    statistics.push({
        id: 2,
        name: 'Forma',
        value: matchResults.length ? matchResults.join(' ') : '-',
    });
    statistics.push({ id: 3, name: 'Meccsek száma', value: player._count.teamPlayer.toFixed() });
    statistics.push({
        id: 4,
        name: 'Részvétel',
        value: ((matchCount ? player._count.teamPlayer / matchCount : 0) * 100).toFixed() + '%',
    });

    return result;
}

export async function getGeneralStatistics(): Promise<StatisticDto[]> {
    await preventPrerenderingInCiPipeline();
    const matches = await prismaClient.match.findMany({
        omit: { id: true },
        include: {
            team: {
                omit: {
                    id: true,
                    matchId: true,
                },
            },
        },
    });
    if (!matches.length) {
        return [];
    }
    const players = await prismaClient.player.findMany({
        omit: { id: true },
        where: { regular: true },
        include: { _count: { select: { teamPlayer: {} } } },
    });
    if (!players.length) {
        return [];
    }

    const result: StatisticDto[] = [];

    const matchCount = matches.length;
    const maxGoalsByTeam = Math.max(...matches.flatMap((m) => m.team.map((t) => t.score)));
    const minGoalsByTeam = Math.min(...matches.flatMap((m) => m.team.map((t) => t.score)));
    const maxGoals = Math.max(...matches.map((m) => m.team[0].score + m.team[1].score));
    const minGoals = Math.min(...matches.map((m) => m.team[0].score + m.team[1].score));
    const biggestWin = matches.reduce(
        (prev, curr) =>
            Math.abs(prev.team[0].score - prev.team[1].score) > Math.abs(curr.team[0].score - curr.team[1].score)
                ? prev
                : curr,
        { team: [{ score: 0 }, { score: 0 }], date: new Date() }
    );
    const biggestWins = matches.filter(
        (m) =>
            Math.abs(m.team[0].score - m.team[1].score) ===
            Math.abs(biggestWin.team[0].score - biggestWin.team[1].score)
    );
    const goalCount = matches.flatMap((m) => m.team.map((t) => t.score)).reduce((prev, curr) => prev + curr);

    const averageGoalCount = matchCount !== 0 ? goalCount / matchCount : 0;
    const biggestScore = players.reduce((prev, curr) => {
        const score = ordinal({ mu: curr.mu, sigma: curr.sigma });
        return prev > score ? prev : score;
    }, 0);
    const bestPlayers = players.filter((p) => ordinal({ mu: p.mu, sigma: p.sigma }) == biggestScore);
    const average = players.length
        ? players.reduce((prev, curr) => prev + ordinal({ mu: curr.mu, sigma: curr.sigma }), 0) / players.length
        : 0;
    const playerCount = players.filter((p) => p._count.teamPlayer > 0).length;
    const mostMatchCountByPlayer = players.reduce(
        (prev, curr) => (prev > curr._count.teamPlayer ? prev : curr._count.teamPlayer),
        0
    );
    const mostMatchesPlayer = players.filter((p) => p._count.teamPlayer === mostMatchCountByPlayer);

    result.push({ id: 1, value: matchCount.toFixed(), name: 'Meccsek száma', detail: 'Összesen' });
    result.push({ id: 2, name: 'Játékosok száma', value: playerCount.toFixed(), detail: 'Összesen' });
    result.push({ id: 3, value: goalCount.toFixed(), name: 'Gólok száma', detail: 'Összesen' });
    result.push({
        id: 4,
        value: formatNumberMaxDigits(averageGoalCount, 1),
        name: 'Átlag gólszám',
        detail: 'Egy meccsen',
    });

    result.push({ id: 5, value: maxGoals.toFixed(), name: 'Legtöbb gól', detail: 'Egy meccsen' });
    result.push({ id: 6, value: minGoals.toFixed(), name: 'Legkevesebb gól', detail: 'Egy meccsen' });
    result.push({ id: 7, value: maxGoalsByTeam.toFixed(), name: 'Legtöbb gól', detail: 'Egy csapat által' });
    result.push({ id: 8, value: minGoalsByTeam.toFixed(), name: 'Legkevesebb gól', detail: 'Egy csapat által' });

    result.push({
        id: 9,
        value: mostMatchCountByPlayer.toFixed(),
        name: 'Legtöbb meccs',
        detail: mostMatchesPlayer[0].name + (mostMatchesPlayer.length > 1 ? ` (+${mostMatchesPlayer.length - 1})` : ''),
    });
    result.push({
        id: 10,
        value: `${biggestWin.team[0].score} - ${biggestWin.team[1].score}`,
        name: 'Legnagyobb győzelem',
        detail: formatDate(biggestWin.date) + (biggestWins.length > 1 ? ` (+${biggestWins.length - 1})` : ''),
    });
    result.push({
        id: 11,
        value: formatNumberMaxDigits(biggestScore, 2),
        name: 'Legnagyobb pontszám',
        detail: bestPlayers[0].name + (bestPlayers.length > 1 ? ` (+${bestPlayers.length - 1})` : ''),
    });
    result.push({
        id: 12,
        name: 'Átlag pontszám',
        value: formatNumberMaxDigits(average, 2),
        detail: 'Összesen',
    });

    return result;
}
