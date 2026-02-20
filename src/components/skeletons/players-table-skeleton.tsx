import { JSX } from 'react';
import { Card } from '../card';

export function PlayersTableSkeleton(): JSX.Element {
    return (
        <Card className="pt-0 sm:pt-0">
            <table className="w-full border-separate border-spacing-y-1 sm:border-spacing-y-2">
                <thead>
                    <tr>
                        <th className="px-1 sm:px-2">
                            <div className="flex h-6 items-center">
                                <div className="h-4 w-10 animate-pulse rounded bg-gray-500/50 ps-4"></div>
                                <div className="h-4 w-4"></div>
                            </div>
                        </th>
                        <th className="hidden px-1 sm:table-cell sm:px-2">
                            <div className="flex h-6 items-center justify-center">
                                <div className="h-4 w-4"></div>
                                <div className="h-4 w-30 animate-pulse rounded bg-gray-500/50"></div>
                                <div className="h-4 w-4"></div>
                            </div>
                        </th>
                        <th className="hidden px-1 sm:table-cell sm:px-2">
                            <div className="flex h-6 items-center justify-center">
                                <div className="h-4 w-4"></div>
                                <div className="h-4 w-20 animate-pulse rounded bg-gray-500/50"></div>
                                <div className="h-4 w-4"></div>
                            </div>
                        </th>
                        <th className="px-1 sm:px-2">
                            <div className="flex h-6 items-center justify-center">
                                <div className="h-4 w-4"></div>
                                <div className="h-4 w-20 animate-pulse rounded bg-gray-500/50"></div>
                                <div className="h-4 w-4"></div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {playerPlaceholders.map((p) => (
                        <tr className="glass-nested" key={p.id}>
                            <td className="rounded-s-md border border-e-0 border-white/25">
                                <div className="flex h-8 items-center p-1 sm:h-10 sm:p-2">
                                    <div
                                        className={`h-4 animate-pulse rounded bg-gray-500/50 ${p.nameClassName}`}
                                    ></div>
                                </div>
                            </td>
                            <td className="hidden border-y border-white/25 sm:table-cell">
                                <div className="flex h-8 items-center justify-center p-1 sm:h-10 sm:p-2">
                                    <div
                                        className={`h-4 animate-pulse rounded bg-gray-500/50 ${p.matchCountClassName}`}
                                    ></div>
                                </div>
                            </td>
                            <td className="hidden border-y border-white/25 sm:table-cell">
                                <div className="flex h-8 items-center justify-center p-1 sm:h-10 sm:p-2">
                                    <div
                                        className={`h-4 animate-pulse rounded bg-gray-500/50 ${p.matchRatioClassName}`}
                                    ></div>
                                </div>
                            </td>
                            <td className="rounded-e-md border border-s-0 border-white/25">
                                <div className="flex h-8 items-center justify-center p-1 sm:h-10 sm:p-2">
                                    <div
                                        className={`h-4 animate-pulse rounded bg-gray-500/50 ${p.ordinalClassName}`}
                                    ></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex flex-col items-center justify-between gap-1 sm:flex-row sm:gap-2">
                <div className="h-6 w-50 animate-pulse rounded bg-gray-500/50"></div>
                <div className="h-6.5 w-46 animate-pulse rounded bg-gray-500/50"></div>
                <div className="h-6 w-32 animate-pulse rounded bg-gray-500/50"></div>
            </div>
        </Card>
    );
}

const playerPlaceholders = [
    {
        id: 1,
        nameClassName: 'w-24',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-6 ms-4',
    },
    {
        id: 2,
        nameClassName: 'w-20',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-10',
        ordinalClassName: 'w-10',
    },
    {
        id: 3,
        nameClassName: 'w-32',
        matchCountClassName: 'w-4 ms-4',
        matchRatioClassName: 'w-4 ms-6',
        ordinalClassName: 'w-6 ms-4',
    },
    {
        id: 4,
        nameClassName: 'w-22',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-10',
    },
    {
        id: 5,
        nameClassName: 'w-26',
        matchCountClassName: 'w-4 ms-4',
        matchRatioClassName: 'w-4 ms-6',
        ordinalClassName: 'w-10',
    },
    {
        id: 6,
        nameClassName: 'w-22',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-6 ms-4',
    },
    {
        id: 7,
        nameClassName: 'w-32',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-10',
    },
    {
        id: 8,
        nameClassName: 'w-36',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-10',
    },
    {
        id: 9,
        nameClassName: 'w-22',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-10',
        ordinalClassName: 'w-10',
    },
    {
        id: 10,
        nameClassName: 'w-30',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-6 ms-4',
    },
    {
        id: 11,
        nameClassName: 'w-24',
        matchCountClassName: 'w-4 ms-4',
        matchRatioClassName: 'w-4 ms-6',
        ordinalClassName: 'w-10',
    },
    {
        id: 12,
        nameClassName: 'w-26',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-6 ms-4',
    },
];
