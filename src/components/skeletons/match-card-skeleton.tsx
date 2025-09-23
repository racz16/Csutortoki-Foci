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
        <Card className="flex animate-pulse flex-col justify-between gap-1 border-gray-200 sm:gap-2">
            <div>
                <div className="flex h-6 items-center justify-center">
                    <div className="h-4 w-24 rounded bg-gray-200"></div>
                </div>
                <div className="flex h-10 items-center justify-center">
                    <div className="h-9 w-32 rounded bg-gray-200"></div>
                </div>
                <div className="flex flex-col justify-center gap-1">
                    {matchPlaceholders.map((item) => (
                        <div key={item.id} className="grid grid-cols-2 gap-2 sm:gap-4">
                            <div className="flex items-center justify-between">
                                <div className="h-6 w-10 rounded bg-gray-200"></div>
                                <div className={`h-4 rounded bg-gray-200 ${item.className}`}></div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className={`h-4 rounded bg-gray-200 ${item.className}`}></div>
                                <div className="h-6 w-10 rounded bg-gray-200"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex h-7 items-end justify-center">
                <div className="h-5 w-24 rounded bg-gray-200"></div>
            </div>
        </Card>
    );
}
