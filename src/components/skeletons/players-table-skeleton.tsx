import { JSX } from 'react';
import { Card } from '../card';

export function PlayersTableSkeleton(): JSX.Element {
    return (
        <Card className="animate-pulse border-gray-200">
            <table className="w-full">
                <thead className="border-b-1 border-gray-200">
                    <tr>
                        <th className="p-2">
                            <div className="flex h-6 items-center">
                                <div className="h-4 w-10 rounded bg-gray-200 ps-4"></div>
                            </div>
                        </th>
                        <th className="hidden p-2 sm:table-cell">
                            <div className="flex h-6 items-center justify-center">
                                <div className="h-4 w-30 rounded bg-gray-200"></div>
                            </div>
                        </th>
                        <th className="hidden p-2 sm:table-cell">
                            <div className="flex h-6 items-center justify-center">
                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                            </div>
                        </th>
                        <th className="p-2">
                            <div className="flex h-6 items-center justify-center">
                                <div className="h-4 w-20 rounded bg-gray-200"></div>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {playerPlaceholders.map((p, i) => (
                        <tr key={p.id}>
                            <td className={`${i === 0 && 'pt-2'}`}>
                                <div className="flex h-8 items-center p-1">
                                    <div className={`h-4 rounded bg-gray-200 ${p.nameClassName}`}></div>
                                </div>
                            </td>
                            <td className={`hidden sm:table-cell ${i === 0 && 'pt-2'}`}>
                                <div className="flex h-8 items-center justify-center p-1">
                                    <div className={`h-4 rounded bg-gray-200 ${p.matchCountClassName}`}></div>
                                </div>
                            </td>
                            <td className={`hidden sm:table-cell ${i === 0 && 'pt-2'}`}>
                                <div className="flex h-8 items-center justify-center p-1">
                                    <div className={`h-4 rounded bg-gray-200 ${p.matchRatioClassName}`}></div>
                                </div>
                            </td>
                            <td className={`${i === 0 && 'pt-2'}`}>
                                <div className="flex h-8 items-center justify-center p-1">
                                    <div className={`h-4 rounded bg-gray-200 ${p.ordinalClassName}`}></div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
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
    {
        id: 13,
        nameClassName: 'w-24',
        matchCountClassName: 'w-8',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-10',
    },
    {
        id: 14,
        nameClassName: 'w-28',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-10',
        ordinalClassName: 'w-10',
    },
    {
        id: 15,
        nameClassName: 'w-26',
        matchCountClassName: 'w-6 ms-2',
        matchRatioClassName: 'w-8 ms-2',
        ordinalClassName: 'w-6 ms-4',
    },
    // {
    //     id: 16,
    //     nameClassName: 'w-26',
    //     matchCountClassName: 'w-6 ms-2',
    //     matchRatioClassName: 'w-8 ms-2',
    //     ordinalClassName: 'w-6 ms-4',
    // },
    // {
    //     id: 17,
    //     nameClassName: 'w-26',
    //     matchCountClassName: 'w-6 ms-2',
    //     matchRatioClassName: 'w-8 ms-2',
    //     ordinalClassName: 'w-6 ms-4',
    // },
    // {
    //     id: 18,
    //     nameClassName: 'w-26',
    //     matchCountClassName: 'w-6 ms-2',
    //     matchRatioClassName: 'w-8 ms-2',
    //     ordinalClassName: 'w-6 ms-4',
    // },
];
