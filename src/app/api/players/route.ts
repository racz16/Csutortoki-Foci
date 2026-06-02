import { getAllPlayers } from '@/logic/players';
import { parseDateTimeLocalToUtc } from '@/utility';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const date = getDate(req);
        const matchId = getMatchId(req);
        const result = await getAllPlayers(date, matchId);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}

function getMatchId(req: NextRequest): number | undefined {
    const value = req.nextUrl.searchParams.get('matchId');
    return value ? parseInt(value) : undefined;
}

function getDate(req: NextRequest): Date | undefined {
    const date = req.nextUrl.searchParams.get('date');
    return date ? parseDateTimeLocalToUtc(date) : undefined;
}
