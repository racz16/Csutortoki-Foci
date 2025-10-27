import { JSX } from 'react';
import { Card } from '../card';
import { StatisticCardSkeleton } from './statistic-card-skeleton';

export function PlayerStatisticsCardSkeleton(): JSX.Element {
    const statisticPlaceholders = [1, 2, 3];
    return (
        <Card className="h-full">
            <div className="flex h-full grow flex-col gap-1 sm:gap-2">
                <div className="flex h-7 items-center justify-center">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-500/50"></div>
                </div>
                <div className="flex grow gap-1 sm:gap-2">
                    <div className="glass-nested hidden aspect-[9/16] h-full rounded-lg lg:block"></div>
                    <div className="flex w-full flex-col gap-1 sm:gap-2">
                        <div className="grid grow grid-cols-2 gap-1 sm:gap-2">
                            {statisticPlaceholders.map((s, i) => (
                                <StatisticCardSkeleton
                                    size="small"
                                    className={i === statisticPlaceholders.length - 1 ? 'col-span-2' : ''}
                                    key={s}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
