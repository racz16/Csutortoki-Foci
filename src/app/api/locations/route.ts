import { getLocations } from '@/logic/matches';

export async function GET(): Promise<Response> {
    try {
        const result = await getLocations();
        return Response.json(result);
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}
