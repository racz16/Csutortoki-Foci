import { JSX } from 'react';
import { Card } from '../card';
import { StatisticCardSkeleton } from './statistic-card-skeleton';

export function PlayerStatisticsSkeleton(): JSX.Element {
    const statisticPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex h-8.5 items-center">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-500/50"></div>
            </div>
            <div className="grid grid-cols-2 grid-rows-21 gap-2 sm:grid-cols-4 sm:grid-rows-9 sm:gap-4">
                <Card className="col-span-2 row-span-6 flex items-end justify-center sm:col-span-1 lg:row-span-9">
                    <div className="flex aspect-9/16 w-50"></div>
                </Card>
                {statisticPlaceholders.map((s, i) => (
                    <StatisticCardSkeleton
                        key={s}
                        className={i === statisticPlaceholders.length - 1 ? 'col-span-2 lg:col-span-1' : ''}
                    />
                ))}
            </div>
        </div>
    );
}
