import { MatchDto } from '@/dtos/match-dto';
import { ordinal, predictWin, rating, Team } from 'openskill';
import { prismaClient } from './prisma';

interface MatchQueryResult {
    id: number;
    date: Date;
    teams: TeamQueryResult[];
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
}

interface PlayerQueryResult {
    id: number;
    name: string;
}

export async function getLastMatch(): Promise<MatchDto> {
    const match = await prismaClient.match.findFirstOrThrow({
        orderBy: { date: 'desc' },
        include: {
            teams: {
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
        },
    });
    return mapMatchToDto(match);
}

function mapMatchToDto(match: MatchQueryResult): MatchDto {
    const predictions = computePredictions(match.teams);
    return {
        id: match.id,
        date: match.date.toString(),
        teams: match.teams.map((t, ti) => ({
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
