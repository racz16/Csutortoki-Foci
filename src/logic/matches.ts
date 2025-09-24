import { MatchDto } from '@/dtos/match-dto';
import { MatchesDto } from '@/dtos/matches-dto';
import { Prisma } from '@/generated/prisma';
import { ordinal, predictWin, rating, Team } from 'openskill';
import { prismaClient } from './prisma';

interface MatchQueryResult {
    id: number;
    date: Date;
    team: TeamQueryResult[];
    location: Location;
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
    weight: number | null;
}

interface PlayerQueryResult {
    id: number;
    name: string;
    regular: boolean;
}

interface Location {
    name: string;
}

export async function getMatches(nextDate?: Date): Promise<MatchesDto> {
    const pageSize = 10;
    const where: Prisma.MatchWhereInput | undefined = nextDate ? { date: { lte: nextDate } } : undefined;

    const matches = await prismaClient.match.findMany({
        where,
        orderBy: { date: 'desc' },
        take: pageSize + 1,
        include: {
            team: {
                orderBy: { id: 'asc' },
                include: {
                    teamPlayer: {
                        orderBy: { player: { name: 'asc' } },
                        include: { player: { omit: { mu: true, sigma: true } } },
                        omit: { id: true, playerId: true, teamId: true },
                    },
                },
                omit: { id: true, matchId: true },
            },
            location: { omit: { id: true } },
        },
        omit: { locationId: true },
    });

    const newNextDate = matches.length === pageSize + 1 ? (matches.pop()?.date?.toString() ?? null) : null;
    return { matches: matches.map((m) => mapMatchToDto(m)), nextDate: newNextDate };
}

export async function getLastMatch(): Promise<MatchDto | null> {
    const match = await prismaClient.match.findFirst({
        orderBy: { date: 'desc' },
        include: {
            team: {
                orderBy: { id: 'asc' },
                include: {
                    teamPlayer: {
                        orderBy: { player: { name: 'asc' } },
                        include: { player: { omit: { mu: true, sigma: true } } },
                        omit: { id: true, playerId: true, teamId: true },
                    },
                },
                omit: { id: true, matchId: true },
            },
            location: { omit: { id: true } },
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
        team: match.team.map((t, ti) => ({
            score: t.score,
            chance: predictions[ti],
            teamPlayer: t.teamPlayer.map((tp) => {
                const beforeRating = ordinal({ mu: tp.beforeMu, sigma: tp.beforeSigma });
                const afterRating = ordinal({ mu: tp.afterMu, sigma: tp.afterSigma });
                return {
                    playerId: tp.player.id,
                    name: tp.player.name,
                    beforeRating: beforeRating,
                    ratingChange: afterRating - beforeRating,
                    regular: tp.player.regular,
                    weight: tp.weight ?? 1,
                };
            }),
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
