import { PlayerListDto } from '@/dtos/player-list-dto';
import { ordinal } from 'openskill';
import { prismaClient } from './prisma';

interface PlayerQueryResult {
    id: number;
    name: string;
    mu: number;
    sigma: number;
    _count: { teamPlayer: number };
}

export async function getPlayers(): Promise<PlayerListDto[]> {
    const matchCount = await prismaClient.match.count();
    const players = await prismaClient.player.findMany({
        // TODO
        where: { NOT: { name: 'KÜLSŐS' } },
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
    };
}
