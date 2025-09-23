import { PlayerListDto } from '@/dtos/player-list-dto';
import { SortAscendingIcon, SortDescendingIcon } from '@phosphor-icons/react';
import { JSX } from 'react';

export function PlayersTableSortIcon({
    orderBy,
    orderByDirection,
    name,
}: {
    orderBy: keyof PlayerListDto;
    orderByDirection: 'asc' | 'desc';
    name: keyof PlayerListDto;
}): JSX.Element {
    return (
        <>
            {orderBy === name && orderByDirection === 'asc' && <SortAscendingIcon />}
            {orderBy === name && orderByDirection === 'desc' && <SortDescendingIcon />}
            {orderBy !== name && <SortDescendingIcon className="opacity-0 group-hover:opacity-100" />}
        </>
    );
}
