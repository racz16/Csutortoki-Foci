'use client';

import { isAdmin } from '@/utility';
import { PlusIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX, useRef } from 'react';
import { PlayerDialog } from '../player-dialog';

export function NewPlayerButton(): JSX.Element {
    const session = useSession();
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <>
            <button
                onClick={() => dialogRef.current?.showModal()}
                className="interactivity interactivity-normal"
                aria-label="Létrehozás"
            >
                <PlusIcon weight="bold" />
            </button>
            <PlayerDialog dialogRef={dialogRef} />
        </>
    );
}
