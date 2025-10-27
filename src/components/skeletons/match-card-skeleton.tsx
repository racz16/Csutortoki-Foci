import { JSX } from 'react';
import { Card } from '../card';

export function MatchCardSkeleton(): JSX.Element {
    const matchPlaceholders = [
        { id: 1, className: 'w-20 md:w-26' },
        { id: 2, className: 'w-18 md:w-22' },
        { id: 3, className: 'w-22 md:w-30' },
        { id: 4, className: 'w-18 md:w-22' },
        { id: 5, className: 'w-16 md:w-18' },
        { id: 6, className: 'w-22 md:w-30' },
    ];
    return (
        <Card className="flex flex-col justify-between gap-1 sm:gap-2">
            <div>
                <div className="flex h-6 items-center justify-center">
                    <div className="h-4 w-66 animate-pulse rounded bg-gray-500/50"></div>
                </div>
                <div className="flex h-10 items-center justify-center">
                    <div className="h-8 w-32 animate-pulse rounded bg-gray-500/50"></div>
                </div>
                <div className="flex flex-col justify-center gap-1">
                    {matchPlaceholders.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 gap-2">
                            <div className="glass-nested flex items-center justify-between rounded-md p-1">
                                <div className="h-6 w-10 animate-pulse rounded bg-gray-500/50"></div>
                                <div className={`h-4 animate-pulse rounded bg-gray-500/50 ${item.className}`}></div>
                            </div>
                            <div className="glass-nested flex items-center justify-between rounded-md p-1">
                                <div className={`h-4 animate-pulse rounded bg-gray-500/50 ${item.className}`}></div>
                                <div className="h-6 w-10 animate-pulse rounded bg-gray-500/50"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex h-7 items-center justify-center">
                <div className="h-5 w-24 animate-pulse rounded bg-gray-500/50"></div>
            </div>
        </Card>
    );
}
