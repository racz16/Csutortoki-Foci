import { Size } from '@/dtos/types';
import { JSX } from 'react';
import { Card } from '../card';

export function StatisticCardSkeleton({
    className,
    size = 'large',
    type = 'simple',
}: {
    className?: string;
    size?: Size;
    type?: 'simple' | 'match-form';
}): JSX.Element {
    const matches = [1, 2, 3, 4, 5];
    return (
        <Card size={size} className={`row-span-3 grid grid-rows-subgrid gap-1 sm:gap-2 ${className}`}>
            {type === 'simple' && (
                <>
                    <div className="flex h-6 items-center">
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-500/50"></div>
                    </div>
                    <div className="flex h-9 items-center justify-center self-center">
                        <div className="h-7.5 w-12 animate-pulse rounded bg-gray-500/50"></div>
                    </div>
                    <div className="flex h-5 items-center self-end">
                        <div className="h-3.5 w-20 animate-pulse rounded bg-gray-500/50"></div>
                    </div>
                </>
            )}
            {type === 'match-form' && (
                <>
                    <div className="flex h-6 items-center">
                        <div className="h-4 w-28 animate-pulse rounded bg-gray-500/50"></div>
                    </div>
                    <div className="flex items-center justify-evenly gap-1 sm:gap-2">
                        {matches.map((m, i) => (
                            <div className="flex flex-col items-center gap-1" key={m}>
                                <div
                                    className={`${i === matches.length - 1 ? 'h-15 w-15' : 'my-2.5 h-10 w-10'} animate-pulse rounded-full bg-gray-500/50`}
                                ></div>
                                <div className="flex h-5 items-center">
                                    <div className="h-3.5 w-10 animate-pulse rounded bg-gray-500/50"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex h-5 items-center self-end">
                        <div className="h-3.5 w-20 animate-pulse rounded bg-gray-500/50"></div>
                    </div>
                </>
            )}
        </Card>
    );
}
