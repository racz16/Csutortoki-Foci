import { JSX } from 'react';
import { StatisticCardSkeleton } from './statistic-card-skeleton';

export function GlobalStatisticsSkeleton(): JSX.Element {
    const statisticPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {statisticPlaceholders.map((s) => (
                <StatisticCardSkeleton key={s} />
            ))}
        </div>
    );
}
