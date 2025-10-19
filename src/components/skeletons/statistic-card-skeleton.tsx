import { JSX } from 'react';
import { Card } from '../card';

export function StatisticCardSkeleton({ className }: { className?: string }): JSX.Element {
    return (
        <Card className={`row-span-3 grid grid-rows-subgrid gap-1 border-gray-200 sm:gap-2 ${className}`}>
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
    );
}
