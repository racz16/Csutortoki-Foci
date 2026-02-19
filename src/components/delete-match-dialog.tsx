'use client';

import { deleteMatchEndpoint } from '@/actions';
import { XIcon } from '@phosphor-icons/react';
import { JSX, useActionState, useEffect } from 'react';
import { useDialog } from './dialog-provider';

export function DeleteMatchDialog({ id }: { id: number }): JSX.Element {
    const { close } = useDialog();
    const [state, action, isPending] = useActionState(deleteMatchEndpoint, { successful: false });

    useEffect(() => {
        if (state.successful) {
            close();
        }
    }, [close, state]);

    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl">Meccs törlése</h2>
                <button
                    type="button"
                    onClick={close}
                    className="interactivity interactivity-normal"
                    aria-label="Felugró ablak bezárása"
                >
                    <XIcon />
                </button>
            </div>
            <p>Biztosan törölni szeretnéd a meccset? Ez a művelet nem vonható vissza.</p>
            {state.globalErrors?.map((error) => (
                <div className="text-red-800" key={error}>
                    {error}
                </div>
            ))}
            <form action={action}>
                <input type="hidden" name="id" value={id} />
                <div className="flex justify-center gap-2">
                    <button type="submit" disabled={isPending} className="interactivity interactivity-danger">
                        Törlés
                    </button>
                    <button type="button" onClick={close} className="interactivity interactivity-normal">
                        Mégse
                    </button>
                </div>
            </form>
        </div>
    );
}
