'use client';

import { isAdmin } from '@/utility';
import { PencilIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX, useRef } from 'react';
import { PlayerDialog } from '../player-dialog';

export function EditPlayerButton({ id, name, regular }: { id: number; name: string; regular: boolean }): JSX.Element {
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
                aria-label="Szerkesztés"
            >
                <PencilIcon />
            </button>
            <PlayerDialog id={id} name={name} regular={regular} dialogRef={dialogRef} />
        </>
    );
}
