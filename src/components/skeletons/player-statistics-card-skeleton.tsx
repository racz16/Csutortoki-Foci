import { JSX } from 'react';
import { Card } from '../card';
import { StatisticCardSkeleton } from './statistic-card-skeleton';

export function PlayerStatisticsCardSkeleton(): JSX.Element {
    const statisticPlaceholders = [1, 2, 3];
    return (
        <Card className="animate-pulse border-gray-200">
            <div className="flex h-full grow flex-col gap-1 sm:gap-2">
                <div className="flex h-7 items-center justify-center">
                    <div className="h-5 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="flex grow gap-1 sm:gap-2">
                    <div className="hidden aspect-[9/16] h-full rounded-lg bg-gray-200 lg:block"></div>
                    <div className="flex w-full flex-col gap-1 sm:gap-2">
                        <div className="grid grow grid-cols-2 gap-1 sm:gap-2">
                            {statisticPlaceholders.map((s, i) => (
                                <StatisticCardSkeleton
                                    key={s}
                                    className={i === statisticPlaceholders.length - 1 ? 'col-span-2' : ''}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
