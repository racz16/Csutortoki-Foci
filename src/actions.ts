'use server';

import { rate, rating, Team } from 'openskill';
import { prismaClient } from './logic/prisma';

interface TeamQueryResult {
    score: number;
    teamPlayer: TeamPlayerQueryResult[];
}

interface TeamPlayerQueryResult {
    id: number;
    player: PlayerQueryResult;
}

interface PlayerQueryResult {
    id: number;
    mu: number;
    sigma: number;
}

export async function updateAll(): Promise<void> {
    await init();
    const matches = await prismaClient.match.findMany({ orderBy: { date: 'asc' }, omit: { date: true } });
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
    const match = await prismaClient.match.findFirstOrThrow({
        orderBy: { date: 'desc' },
        omit: { date: true },
    });
    await update(match.id);
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
                },
            },
        },
        omit: { id: true, matchId: true },
    });
    await updateRatings(teams);
    // TODO: update statistics
}

async function updateRatings(teams: TeamQueryResult[]): Promise<void> {
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

function computeResults(teams: TeamQueryResult[]): Team[] {
    const osTeams: Team[] = [];
    const osScore: number[] = [];
    for (const team of teams) {
        osScore.push(team.score);
        const osTeam: Team = [];
        for (const teamPlayer of team.teamPlayer) {
            const osRating = rating({ mu: teamPlayer.player.mu, sigma: teamPlayer.player.sigma });
            osTeam.push(osRating);
        }
        osTeams.push(osTeam);
    }
    return rate(osTeams, { score: osScore });
}
