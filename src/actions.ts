'use server';

import { revalidatePath } from 'next/cache';
import { rate, rating, Team } from 'openskill';
import { DeletePlayerDto } from './dtos/delete-player-dto';
import { PlayerStateDto } from './dtos/player-state-dto';
import { createPlayer, deletePlayer, editPlayer } from './logic/players';
import prismaClient from './logic/prisma';
import { updateGlobalStatistics, updatePlayerStatistics } from './logic/statistics';

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

export async function createPlayerEndpoint(
    prevState: PlayerStateDto | null,
    player: FormData
): Promise<PlayerStateDto | null> {
    return await createPlayer({
        name: player.get('name')?.toString()?.trim() ?? '',
        regular: player.get('regular') === 'on',
    });
}

export async function editPlayerEndpoint(
    id: number,
    prevState: PlayerStateDto | null,
    player: FormData
): Promise<PlayerStateDto | null> {
    return await editPlayer({
        id,
        name: player.get('name')?.toString()?.trim() ?? '',
        regular: player.get('regular') === 'on',
    });
}

export async function deletePlayerEndpoint(dto: DeletePlayerDto): Promise<PlayerStateDto | null> {
    return await deletePlayer(dto);
}

export async function updateAllEndpoint(): Promise<void> {
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

export async function updateLastEndpoint(): Promise<void> {
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
    const playerIds = await prismaClient.player.findMany({ where: { regular: true }, select: { id: true } });
    for (const { id } of playerIds) {
        await updatePlayerStatistics(id);
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

function revalidate(): void {
    revalidatePath('/');
    revalidatePath('/matches');
    revalidatePath('/players');
}

export async function revalidatePathEndpoint(path: string, type?: 'layout' | 'page'): Promise<void> {
    revalidatePath(path, type);
}
