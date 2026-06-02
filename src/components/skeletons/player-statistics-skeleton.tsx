import { JSX } from 'react';
import { StatisticCardSkeleton } from './statistic-card-skeleton';

export function PlayerStatisticsSkeleton(): JSX.Element {
    const statisticPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8];
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex h-8.5 items-center">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-500/50"></div>
            </div>
            <div className="grid grid-cols-2 grid-rows-12 gap-2 sm:grid-cols-4 sm:grid-rows-6 sm:gap-4">
                {statisticPlaceholders.map((s, i) => (
                    <StatisticCardSkeleton key={s} />
                ))}
            </div>
        </div>
    );
}
