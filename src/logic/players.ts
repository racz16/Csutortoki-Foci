import { PlayerListDto } from '@/dtos/player-list-dto';
import { preventPrerenderingInCiPipeline } from '@/utility';
import { ordinal } from 'openskill';
import { prismaClient } from './prisma';

interface PlayerQueryResult {
    id: number;
    name: string;
    mu: number;
    sigma: number;
    regular: boolean;
    _count: { teamPlayer: number };
}

export async function getPlayers(): Promise<PlayerListDto[]> {
    await preventPrerenderingInCiPipeline();
    const matchCount = await prismaClient.match.count();
    const players = await prismaClient.player.findMany({
        include: { _count: { select: { teamPlayer: {} } } },
    });
    return players.map((p) => mapPlayerToListDto(p, matchCount));
}

function mapPlayerToListDto(player: PlayerQueryResult, matchCount: number): PlayerListDto {
    return {
        id: player.id,
        name: player.name,
        matchCount: player._count.teamPlayer,
        matchRatio: matchCount ? (player._count.teamPlayer / matchCount) * 100.0 : 0,
        rating: ordinal({ mu: player.mu, sigma: player.sigma }),
        regular: player.regular,
    };
}
