import { JSX } from 'react';
import { Card } from '../card';

export function GlobalStatisticsSkeleton(): JSX.Element {
    const statisticPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
            {statisticPlaceholders.map((s) => (
                <Card
                    className="row-span-3 grid animate-pulse grid-rows-subgrid gap-1 border-gray-200 sm:gap-2"
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
    );
}
