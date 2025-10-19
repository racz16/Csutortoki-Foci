import { getMatches } from '@/logic/matches';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const nextDate = getNextDate(req);
        const playerId = getPlayerId(req);
        const result = await getMatches(nextDate, playerId);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}

function getNextDate(req: NextRequest): Date | undefined {
    const date = req.nextUrl.searchParams.get('nextDate');
    return date ? new Date(date) : undefined;
}

function getPlayerId(req: NextRequest): number | undefined {
    const id = req.nextUrl.searchParams.get('playerId');
    return id ? +id : undefined;
}
