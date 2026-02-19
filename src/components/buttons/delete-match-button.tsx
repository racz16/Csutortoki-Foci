'use client';

import { isAdmin } from '@/utility';
import { TrashIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';
import { DeleteMatchDialog } from '../delete-match-dialog';
import { useDialog } from '../dialog-provider';

export function DeleteMatchButton({ id }: { id: number }): JSX.Element {
    const { open } = useDialog();
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => open(DeleteMatchDialog, { id }, 'small')}
            className="interactivity interactivity-danger"
            aria-label="Törlés"
        >
            <TrashIcon />
        </button>
    );
}
