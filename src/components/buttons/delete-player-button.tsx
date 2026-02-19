'use client';

import { isAdmin } from '@/utility';
import { TrashIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';
import { DeletePlayerDialog } from '../delete-player-dialog';
import { useDialog } from '../dialog-provider';

export function DeletePlayerButton({
    id,
    name,
    matchCount,
    navigate = false,
}: {
    id: number;
    name: string;
    matchCount: number;
    navigate?: boolean;
}): JSX.Element {
    const { open } = useDialog();
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => open(DeletePlayerDialog, { id, name, navigate }, 'small')}
            className="interactivity interactivity-danger"
            disabled={matchCount > 0}
            title={matchCount > 0 ? 'Csak a meccs nélküli játékosok törölhetők' : undefined}
            aria-label="Törlés"
        >
            <TrashIcon />
        </button>
    );
}
