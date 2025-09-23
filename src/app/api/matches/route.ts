import { getMatches } from '@/logic/matches';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest): Promise<Response> {
    try {
        let date: Date | undefined;
        const nextDate = req.nextUrl.searchParams.get('nextDate');
        if (nextDate) {
            date = new Date(nextDate);
        }
        const result = await getMatches(date);
        return Response.json(result);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
