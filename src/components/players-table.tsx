'use client';

import { PlayerListDto } from '@/dtos/player-list-dto';
import { formatNumberMinMaxDigits, isAdmin } from '@/utility';
import {
    CaretLeftIcon,
    CaretLineLeftIcon,
    CaretLineRightIcon,
    CaretRightIcon,
    PencilIcon,
    TrashIcon,
} from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ChangeEvent, JSX, useEffect, useState } from 'react';
import { Card } from './card';
import { PlayersTableSortIcon } from './players-table-sort-icon';
import { PlayersTableSkeleton } from './skeletons/players-table-skeleton';

export function PlayersTable({ players }: { players: PlayerListDto[] }): JSX.Element {
    const [orderBy, setOrderBy] = useState<keyof PlayerListDto>('name');
    const [orderByDirection, setOrderByDirection] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState<number | null>(null);
    const [hideNonRegulars, setHideNonRegulars] = useState<boolean | null>(null);

    const session = useSession();
    const admin = isAdmin(session);

    useEffect(() => {
        setPageSize(getInitialPageSize());
        setHideNonRegulars(getInitialHideNonRegulars());
    }, []);

    if (pageSize === null || hideNonRegulars === null) {
        return <PlayersTableSkeleton />;
    }

    function changeOrder(orderByClicked: keyof PlayerListDto): void {
        setOrderBy(orderByClicked);
        if (orderBy === orderByClicked) {
            setOrderByDirection(orderByDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setOrderByDirection(orderByClicked === 'name' ? 'asc' : 'desc');
        }
    }

    function changePage(page: number): void {
        setPage(page);
        focusTableHeader();
    }

    function changePageSize(event: ChangeEvent<HTMLSelectElement>): void {
        const newPageSize = +event.target.value;
        localStorage.setItem(PAGE_SIZE_KEY, newPageSize.toString());
        setPageSize(newPageSize);
        const playerCount = players.filter((p) => !hideNonRegulars || p.regular).length;
        const pageCount = Math.max(Math.ceil(playerCount / newPageSize), 1);
        if (pageCount <= page) {
            changePage(pageCount - 1);
        }
        focusTableHeader();
    }

    function changeHideNoneRegulars(): void {
        if (pageSize === null) {
            return;
        }
        const newHideNonRegulars = !hideNonRegulars;
        localStorage.setItem(HIDE_NON_REGULARS_KEY, newHideNonRegulars.toString());
        setHideNonRegulars(newHideNonRegulars);
        const playerCount = players.filter((p) => !newHideNonRegulars || p.regular).length;
        const pageCount = Math.max(Math.ceil(playerCount / pageSize), 1);
        if (pageCount <= page) {
            changePage(pageCount - 1);
        }
        focusTableHeader();
    }

    function getAriaSort(column: keyof PlayerListDto): 'ascending' | 'descending' | 'none' {
        return orderBy === column ? (orderByDirection === 'asc' ? 'ascending' : 'descending') : 'none';
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

    const filteredPlayers = players.filter((p) => !hideNonRegulars || p.regular);
    const pageCount = Math.max(Math.ceil(filteredPlayers.length / pageSize), 1);
    const pagedPlayers = filteredPlayers.filter((p, i) => page * pageSize <= i && i < page * pageSize + pageSize);

    const pageStartIndex = Math.min(page * pageSize + 1, filteredPlayers.length);
    const pageEndIndex = Math.min(page * pageSize + pageSize, filteredPlayers.length);

    return (
        <Card className="pt-0 sm:pt-0">
            <table className="w-full border-separate border-spacing-y-1 sm:border-spacing-y-2">
                <thead>
                    <tr>
                        {TABLE_COLUMNS.map((c) => (
                            <th
                                scope="col"
                                aria-sort={getAriaSort(c.key)}
                                className={c.hiddenInSmallScreens ? 'hidden sm:table-cell' : undefined}
                                key={c.key}
                            >
                                <button
                                    onClick={() => changeOrder(c.key)}
                                    className={`group flex w-full cursor-pointer items-center gap-1 sm:gap-2 ${!c.leftAligned ? 'justify-center' : undefined}`}
                                >
                                    {!c.leftAligned && <div className="h-4 w-4" aria-hidden="true"></div>}
                                    <div>{c.name}</div>
                                    <PlayersTableSortIcon
                                        name={c.key}
                                        orderBy={orderBy}
                                        orderByDirection={orderByDirection}
                                    />
                                </button>
                            </th>
                        ))}
                        {admin && <th scope="col">Műveletek</th>}
                    </tr>
                </thead>
                <tbody>
                    {!pagedPlayers.length && (
                        <tr>
                            <td colSpan={4}>
                                <h3 className="p-2 text-center text-lg sm:p-4">Még nincsenek játékosok</h3>
                            </td>
                        </tr>
                    )}
                    {pagedPlayers.map((p) => (
                        <tr key={p.id}>
                            <td className="rounded-s-md border-1 border-e-0">
                                <div className="m-auto p-1">
                                    <Link className="text-sky-800 hover:text-sky-600" href={`/players/${p.id}`}>
                                        {p.name}
                                    </Link>
                                </div>
                            </td>
                            <td className="hidden border-y-1 sm:table-cell">
                                <div className="m-auto w-10 p-1 text-right">{p.matchCount}</div>
                            </td>
                            <td className="hidden border-y-1 sm:table-cell">
                                <div className="m-auto w-12 p-1 text-right">{p.matchRatio.toFixed()}%</div>
                            </td>
                            <td className={` ${admin ? 'border-y-1' : 'rounded-e-md border-1 border-s-0'}`}>
                                <div className="m-auto w-11 p-1 text-right">
                                    {formatNumberMinMaxDigits(p.rating, 2)}
                                </div>
                            </td>
                            {admin && (
                                <td className="rounded-e-md border-1 border-s-0">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => alert('Játékos szerkesztése')}
                                            className="cursor-pointer text-sky-800 hover:text-sky-600"
                                            aria-label="Szerkesztés"
                                        >
                                            <PencilIcon />
                                        </button>
                                        <button
                                            onClick={() => alert('Játékos örlése')}
                                            disabled={p.matchCount > 0}
                                            className="text-red-800 not-disabled:cursor-pointer hover:text-red-600 disabled:text-gray-500"
                                            title={
                                                p.matchCount > 0
                                                    ? 'Csak a meccs nélküli játékosok törölhetők'
                                                    : undefined
                                            }
                                            aria-label="Törlés"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="flex flex-col justify-between gap-1 sm:flex-row">
                <label className="flex items-center justify-center gap-1">
                    <input onChange={changeHideNoneRegulars} type="checkbox" checked={hideNonRegulars} />
                    <div>Csak rendszeres játékosok</div>
                </label>
                <nav className="flex justify-center gap-1 sm:gap-2" aria-label="Lapozás">
                    <button
                        onClick={() => changePage(0)}
                        disabled={page === 0}
                        className="flex w-10 items-center justify-center rounded-md border-1 p-1 text-sky-800 not-disabled:cursor-pointer hover:text-white not-disabled:hover:bg-sky-600 disabled:text-gray-500"
                        aria-label="Első oldal"
                    >
                        <CaretLineLeftIcon />
                    </button>
                    <button
                        onClick={() => changePage(page - 1)}
                        disabled={page === 0}
                        className="flex w-10 items-center justify-center rounded-md border-1 p-1 text-sky-800 not-disabled:cursor-pointer hover:text-white not-disabled:hover:bg-sky-600 disabled:text-gray-500"
                        aria-label="Előző oldal"
                    >
                        <CaretLeftIcon />
                    </button>
                    <div
                        className="self-center"
                        aria-label={`${pageStartIndex}-${pageEndIndex} játékos az oldalon, ${filteredPlayers.length} összesen`}
                    >
                        <div aria-hidden="true">{`${pageStartIndex}-${pageEndIndex} / ${filteredPlayers.length}`}</div>
                    </div>
                    <button
                        onClick={() => changePage(page + 1)}
                        disabled={page === pageCount - 1}
                        className="flex w-10 items-center justify-center rounded-md border-1 p-1 text-sky-800 not-disabled:cursor-pointer hover:text-white not-disabled:hover:bg-sky-600 disabled:text-gray-500"
                        aria-label="Következő oldal"
                    >
                        <CaretRightIcon />
                    </button>
                    <button
                        onClick={() => changePage(pageCount - 1)}
                        disabled={page === pageCount - 1}
                        className="flex w-10 items-center justify-center rounded-md border-1 p-1 text-sky-800 not-disabled:cursor-pointer hover:text-white not-disabled:hover:bg-sky-600 disabled:text-gray-500"
                        aria-label="Utolsó oldal"
                    >
                        <CaretLineRightIcon />
                    </button>
                </nav>
                <div className="flex items-center justify-center gap-1">
                    <div>Oldalméret</div>
                    <select
                        value={pageSize}
                        onChange={(e) => changePageSize(e)}
                        className="self-stretch rounded-md border-1 p-1"
                    >
                        <option value={8}>8</option>
                        <option value={12}>12</option>
                        <option value={16}>16</option>
                        <option value={20}>20</option>
                    </select>
                </div>
            </div>
        </Card>
    );
}

const HIDE_NON_REGULARS_KEY = 'PLAYERS_TABLE_HIDE_NON_REGULARS';
const PAGE_SIZE_KEY = 'PLAYERS_TABLE_PAGE_SIZE';
const TABLE_COLUMNS = [
    {
        key: 'name',
        name: 'Név',
        leftAligned: true,
        hiddenInSmallScreens: false,
    },
    {
        key: 'matchCount',
        name: 'Meccsek száma',
        leftAligned: false,
        hiddenInSmallScreens: true,
    },
    {
        key: 'matchRatio',
        name: 'Részvétel',
        leftAligned: false,
        hiddenInSmallScreens: true,
    },
    {
        key: 'rating',
        name: 'Pontszám',
        leftAligned: false,
        hiddenInSmallScreens: false,
    },
] as const;

function getInitialPageSize(): number {
    const defaultValue = 16;
    const stringValue = localStorage.getItem(PAGE_SIZE_KEY);
    if (!stringValue) {
        return defaultValue;
    }
    const numberValue = Number.parseInt(stringValue);
    if (!numberValue) {
        return defaultValue;
    }
    return numberValue;
}

function getInitialHideNonRegulars(): boolean {
    return localStorage.getItem(HIDE_NON_REGULARS_KEY) !== 'false';
}

function focusTableHeader(): void {
    document.querySelector<HTMLButtonElement>('th button')?.focus();
}
