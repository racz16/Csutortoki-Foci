import { getAllPlayers } from '@/logic/players';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        const date = getDate(req);
        const result = await getAllPlayers(date);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}

function getDate(req: NextRequest): Date | undefined {
    const date = req.nextUrl.searchParams.get('date');
    return date ? new Date(date) : undefined;
}
