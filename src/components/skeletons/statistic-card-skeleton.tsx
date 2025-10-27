import { JSX } from 'react';
import { Card } from '../card';

export function StatisticCardSkeleton({
    className,
    size = 'large',
}: {
    className?: string;
    size?: 'small' | 'large';
}): JSX.Element {
    return (
        <Card size={size} className={`row-span-3 grid grid-rows-subgrid gap-1 sm:gap-2 ${className}`}>
            <div className="flex h-6 items-center">
                <div className="h-4 w-28 animate-pulse rounded bg-gray-500/50"></div>
            </div>
            <div className="flex h-9 items-center justify-center self-center">
                <div className="h-7.5 w-12 animate-pulse rounded bg-gray-500/50"></div>
            </div>
            <div className="flex h-5 items-center self-end">
                <div className="h-3.5 w-20 animate-pulse rounded bg-gray-500/50"></div>
            </div>
        </Card>
    );
}
