'use server';

import { revalidatePath } from 'next/cache';
import { rate, rating, Team } from 'openskill';
import { MatchStateDto } from './dtos/match-state-dto';
import { PlayerStateDto } from './dtos/player-state-dto';
import { createMatch, deleteMatch, editMatch } from './logic/matches';
import { createPlayer, deletePlayer, editPlayer } from './logic/players';
import prismaClient, { TPrismaClient } from './logic/prisma';
import { updateGlobalStatistics, updatePlayerStatistics } from './logic/statistics';
import { DEFAULT_MU, DEFAULT_SIGMA } from './utility';

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

export async function createMatchEndpoint(prevState: MatchStateDto, match: FormData): Promise<MatchStateDto> {
    return await createMatch({
        date: getDate(match, 'date'),
        location: getNumber(match, 'location'),
        score1: getNumber(match, 'score1'),
        score2: getNumber(match, 'score2'),
        team1: getAllNumbers(match, 'team1'),
        team2: getAllNumbers(match, 'team2'),
    });
}

export async function editMatchEndpoint(prevState: MatchStateDto, match: FormData): Promise<MatchStateDto> {
    return await editMatch({
        id: getNumber(match, 'id'),
        date: getDate(match, 'date'),
        location: getNumber(match, 'location'),
        score1: getNumber(match, 'score1'),
        score2: getNumber(match, 'score2'),
        team1: getAllNumbers(match, 'team1'),
        team2: getAllNumbers(match, 'team2'),
    });
}

export async function deleteMatchEndpoint(prevState: MatchStateDto, match: FormData): Promise<MatchStateDto> {
    return await deleteMatch({
        id: getNumber(match, 'id'),
    });
}

export async function createPlayerEndpoint(prevState: PlayerStateDto, player: FormData): Promise<PlayerStateDto> {
    return await createPlayer({
        name: getString(player, 'name'),
        regular: getBoolean(player, 'regular'),
    });
}

export async function editPlayerEndpoint(prevState: PlayerStateDto, player: FormData): Promise<PlayerStateDto> {
    return await editPlayer({
        id: getNumber(player, 'id'),
        name: getString(player, 'name'),
        regular: getBoolean(player, 'regular'),
    });
}

export async function deletePlayerEndpoint(prevState: PlayerStateDto, player: FormData): Promise<PlayerStateDto> {
    return await deletePlayer({
        id: getNumber(player, 'id'),
        navigate: getBoolean(player, 'navigate'),
    });
}

function getNumber(form: FormData, key: string): number | undefined {
    const rawValue = form.get(key);
    return rawValue === null ? undefined : +rawValue;
}

function getAllNumbers(form: FormData, key: string): number[] {
    return form.getAll(key).map((x) => +x);
}

function getString(form: FormData, key: string): string | undefined {
    const rawValue = form.get(key);
    return rawValue === null ? undefined : rawValue.toString();
}

function getBoolean(form: FormData, key: string): boolean {
    return form.has(key);
}

function getDate(form: FormData, key: string): Date | undefined {
    const rawValue = form.get(key);
    if (rawValue) {
        const date = new Date(rawValue.toString());
        date.setSeconds(0, 0);
        return date;
    } else {
        return undefined;
    }
}

export async function updateAllEndpoint(): Promise<void> {
    await prismaClient.$transaction(async (pc) => {
        await init(pc);
        const matches = await pc.match.findMany({
            orderBy: { date: 'asc' },
            omit: { date: true, locationId: true },
        });
        for (const match of matches) {
            await update(pc, match.id);
        }
    });
    revalidate();
}

async function init(pc: TPrismaClient): Promise<void> {
    await pc.player.updateMany({
        data: {
            mu: DEFAULT_MU,
            sigma: DEFAULT_SIGMA,
        },
    });
    await pc.teamPlayer.updateMany({
        data: {
            beforeMu: DEFAULT_MU,
            beforeSigma: DEFAULT_SIGMA,
            afterMu: DEFAULT_MU,
            afterSigma: DEFAULT_SIGMA,
        },
    });
}

export async function updateLastEndpoint(): Promise<void> {
    const match = await prismaClient.match.findFirst({
        orderBy: { date: 'desc' },
        omit: { date: true, locationId: true },
    });
    if (match) {
        await prismaClient.$transaction(async (pc) => {
            await update(pc, match.id);
        });
    }
    revalidate();
}

async function update(pc: TPrismaClient, matchId: number): Promise<void> {
    const teams = await pc.team.findMany({
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
    await updateRatings(pc, teams);
    const playerIds = await pc.player.findMany({ where: { regular: true }, select: { id: true } });
    for (const { id } of playerIds) {
        await updatePlayerStatistics(pc, id);
    }
    await updateGlobalStatistics(pc);
}

async function updateRatings(pc: TPrismaClient, teams: TeamRatingQueryResult[]): Promise<void> {
    const osResults = computeResults(teams);
    for (let i = 0; i < teams.length; i++) {
        const team = teams[i];
        const osTeam = osResults[i];
        for (let j = 0; j < team.teamPlayer.length; j++) {
            const teamPlayer = team.teamPlayer[j];
            const osRating = osTeam[j];
            await pc.teamPlayer.update({
                data: {
                    beforeMu: teamPlayer.player.mu,
                    beforeSigma: teamPlayer.player.sigma,
                    afterMu: osRating.mu,
                    afterSigma: osRating.sigma,
                },
                where: { id: teamPlayer.id },
            });
            await pc.player.update({
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
    revalidatePath('/players/[id]', 'page');
}

export async function revalidatePathEndpoint(path: string, type?: 'layout' | 'page'): Promise<void> {
    revalidatePath(path, type);
}
