import { JSX } from 'react';
import { Card } from '../card';

export function PlayerStatisticsCardSkeleton(): JSX.Element {
    const statisticPlaceholders = [1, 2, 3, 4];
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
                            {statisticPlaceholders.map((s) => (
                                <Card
                                    size="small"
                                    className="row-span-3 grid grid-rows-subgrid gap-1 border-gray-200"
                                    key={s}
                                >
                                    <div className="flex h-6 items-center">
                                        <div className="h-4 w-28 rounded bg-gray-200"></div>
                                    </div>
                                    <div className="flex h-9 items-center justify-center self-center">
                                        <div className="h-7.5 w-12 rounded bg-gray-200"></div>
                                    </div>
                                    <div className="flex h-5 items-center self-end">
                                        <div className="h-3.5 w-20 rounded bg-gray-200"></div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
