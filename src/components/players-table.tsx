'use client';

import { PlayerListDto } from '@/dtos/player-list-dto';
import Link from 'next/link';
import { JSX, useState } from 'react';
import { Card } from './card';
import { PlayersTableSortIcon } from './players-table-sort-icon';

export function PlayersTable({ players }: { players: PlayerListDto[] }): JSX.Element {
    const [orderBy, setOrderBy] = useState<keyof PlayerListDto>('name');
    const [orderByDirection, setOrderByDirection] = useState<'asc' | 'desc'>('asc');

    function order(orderByClicked: keyof PlayerListDto) {
        setOrderBy(orderByClicked);
        if (orderBy === orderByClicked) {
            setOrderByDirection(orderByDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderByDirection(orderByClicked === 'name' ? 'asc' : 'desc');
        }
    }

    players.sort((a, b) => {
        if (a[orderBy] === b[orderBy]) {
            return 0;
        }
        if (orderByDirection === 'asc') {
            return a[orderBy] > b[orderBy] ? 1 : -1;
        } else {
            return a[orderBy] < b[orderBy] ? 1 : -1;
        }
    });

    return (
        <Card>
            <table className="w-full">
                <thead className="mb-10 border-b-1">
                    <tr>
                        <th
                            onClick={() => {
                                order('name');
                            }}
                            className="group cursor-pointer p-2"
                        >
                            <div className="flex items-center gap-2">
                                <div>Név</div>
                                <PlayersTableSortIcon
                                    name="name"
                                    orderBy={orderBy}
                                    orderByDirection={orderByDirection}
                                />
                            </div>
                        </th>
                        <th
                            onClick={() => {
                                order('matchCount');
                            }}
                            className="group hidden cursor-pointer p-2 sm:table-cell"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4"></div>
                                <div>Meccsek száma</div>
                                <PlayersTableSortIcon
                                    name="matchCount"
                                    orderBy={orderBy}
                                    orderByDirection={orderByDirection}
                                />
                            </div>
                        </th>
                        <th
                            onClick={() => {
                                order('matchRatio');
                            }}
                            className="group hidden cursor-pointer p-2 sm:table-cell"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4"></div>
                                <div>Részvétel</div>
                                <PlayersTableSortIcon
                                    name="matchRatio"
                                    orderBy={orderBy}
                                    orderByDirection={orderByDirection}
                                />
                            </div>
                        </th>
                        <th
                            onClick={() => {
                                order('rating');
                            }}
                            className="group cursor-pointer p-2"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-4 w-4"></div>
                                <div>Pontszám</div>
                                <PlayersTableSortIcon
                                    name="rating"
                                    orderBy={orderBy}
                                    orderByDirection={orderByDirection}
                                />
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {!players.length && (
                        <tr>
                            <td colSpan={4}>
                                <h3 className="p-2 text-center text-lg sm:p-4">Még nincsenek játékosok</h3>
                            </td>
                        </tr>
                    )}
                    {players.map((p, i) => (
                        <tr key={p.id}>
                            <td className={`${i === 0 && 'pt-2'}`}>
                                <div className="m-auto p-1">
                                    <Link className="text-sky-800 hover:text-sky-600" href={`/players/${p.id}`}>
                                        {p.name}
                                    </Link>
                                </div>
                            </td>
                            <td className={`hidden sm:table-cell ${i === 0 && 'pt-2'}`}>
                                <div className="m-auto w-12 p-1 text-right">{p.matchCount}</div>
                            </td>
                            <td className={`hidden sm:table-cell ${i === 0 && 'pt-2'}`}>
                                <div className="m-auto w-15 p-1 text-right">{p.matchRatio.toFixed()}%</div>
                            </td>
                            <td className={`${i === 0 && 'pt-2'}`}>
                                <div className="m-auto w-15 p-1 text-right">
                                    {p.rating.toLocaleString('hu', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
}
