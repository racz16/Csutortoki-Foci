'use client';

import { isAdmin } from '@/utility';
import { PencilIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';
import { useDialog } from '../dialog-provider';
import { PlayerDialog } from '../player-dialog';

export function EditPlayerButton({ id, name, regular }: { id: number; name: string; regular: boolean }): JSX.Element {
    const { open } = useDialog();
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => open(PlayerDialog, { id, name, regular }, 'small')}
            className="interactivity interactivity-normal"
            aria-label={`${name} szerkesztése`}
        >
            <PencilIcon />
        </button>
    );
}
