'use client';

import { deletePlayerEndpoint } from '@/actions';
import { PlayerStateDto } from '@/dtos/player-state-dto';
import { isAdmin } from '@/utility';
import { TrashIcon, XIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { JSX, useRef, useState } from 'react';

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
    const session = useSession();
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [state, setState] = useState<PlayerStateDto | null>(null);
    const [pending, setPending] = useState(false);
    if (!isAdmin(session)) {
        return <></>;
    }

    async function submit(): Promise<void> {
        try {
            setState(null);
            setPending(true);
            const result = await deletePlayerEndpoint({ id, navigate });
            if (result) {
                setState(result);
            } else {
                dialogRef.current?.close();
            }
        } finally {
            setPending(false);
        }
    }

    return (
        <>
            <button
                onClick={() => dialogRef.current?.showModal()}
                className="interactivity interactivity-danger"
                disabled={matchCount > 0}
                title={matchCount > 0 ? 'Csak a meccs nélküli játékosok törölhetők' : undefined}
                aria-label="Törlés"
            >
                <TrashIcon />
            </button>
            <dialog ref={dialogRef} onToggle={() => setState(null)} className="dialog glass-dialog">
                <div className="flex flex-col gap-2 sm:gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl">Játékos törlése</h2>
                        <button
                            onClick={() => dialogRef.current?.close()}
                            className="interactivity interactivity-normal"
                            aria-label="Felugró ablak bezárása"
                        >
                            <XIcon />
                        </button>
                    </div>
                    <p>
                        Biztosan törölni szeretnéd a játékost (
                        <Link href={`/players/${id}`} className="link">
                            {name}
                        </Link>
                        )? Ez a művelet nem vonható vissza.
                    </p>
                    {state?.globalErrors?.map((error) => (
                        <div className="text-red-800" key={error}>
                            {error}
                        </div>
                    ))}
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={async () => submit()}
                            disabled={pending}
                            className="interactivity interactivity-danger"
                        >
                            Törlés
                        </button>
                        <button
                            onClick={() => dialogRef.current?.close()}
                            className="interactivity interactivity-normal"
                        >
                            Mégse
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
