'use client';

import { isAdmin } from '@/utility';
import { PlusIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';
import { useDialog } from '../dialog-provider';
import { PlayerDialog } from '../player-dialog';

export function NewPlayerButton(): JSX.Element {
    const { open } = useDialog();
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => open(PlayerDialog, {}, 'small')}
            className="interactivity interactivity-normal"
            aria-label="Létrehozás"
        >
            <PlusIcon weight="bold" />
        </button>
    );
}
