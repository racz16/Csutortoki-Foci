import { RandomPlayerCard } from '@/components/random-player-card';
import { getPlayerStatistics } from '@/logic/statistics';
import { connection } from 'next/server';
import { JSX } from 'react';

export default async function RandomPlayerStatisticsLazy(): Promise<JSX.Element> {
    await connection();
    const playerStatistics = await getPlayerStatistics();
    return playerStatistics ? (
        <RandomPlayerCard playerStatistics={playerStatistics} />
    ) : (
        <h3 className="text-center text-lg">Még nincsenek játékosok</h3>
    );
}
