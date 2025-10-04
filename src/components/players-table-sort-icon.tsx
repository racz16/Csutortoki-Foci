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
        <div className="text-sky-800 group-hover:text-sky-600" aria-hidden="true">
            {orderBy === name && orderByDirection === 'asc' && <SortAscendingIcon />}
            {orderBy === name && orderByDirection === 'desc' && <SortDescendingIcon />}
            {orderBy !== name && name === 'name' && <SortAscendingIcon className="hidden group-hover:block" />}
            {orderBy !== name && name !== 'name' && <SortDescendingIcon className="hidden group-hover:block" />}
            {orderBy !== name && <div className="h-4 w-4 group-hover:hidden"></div>}
        </div>
    );
}
