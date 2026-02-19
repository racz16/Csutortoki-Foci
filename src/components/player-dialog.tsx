'use client';

import { createPlayerEndpoint, editPlayerEndpoint } from '@/actions';
import { XIcon } from '@phosphor-icons/react';
import { JSX, useActionState, useEffect, useState } from 'react';
import { useDialog } from './dialog-provider';

type PlayerKey = 'name' | 'regular';

export function PlayerDialog({
    id,
    name = '',
    regular = true,
}: {
    id?: number;
    name?: string;
    regular?: boolean;
}): JSX.Element {
    const { close } = useDialog();
    const playerAction = id ? editPlayerEndpoint : createPlayerEndpoint;
    const [state, action, isPending] = useActionState(playerAction, {
        successful: false,
        state: id ? { id, name, regular } : undefined,
    });
    const [dirtyFields, setDirtyFields] = useState<Set<PlayerKey>>(new Set());

    useEffect(() => {
        if (state.successful) {
            close();
        }
    }, [close, state]);

    useEffect(() => {
        setDirtyFields(new Set());
    }, [state]);

    function setDirty(key: PlayerKey): void {
        setDirtyFields((prev) => new Set(prev).add(key));
    }

    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl">{id ? 'Játékos szerkesztése' : 'Játékos létrehozása'}</h2>
                <button
                    type="button"
                    onClick={close}
                    className="interactivity interactivity-normal"
                    aria-label="Felugró ablak bezárása"
                >
                    <XIcon />
                </button>
            </div>
            <form action={action} className="flex flex-col gap-2 sm:gap-4">
                <div>
                    <input type="hidden" name="id" value={id} />
                    <label>
                        <div className="text-sm">
                            Név<span className="text-red-800">*</span>
                        </div>
                        <input
                            name="name"
                            defaultValue={state.state?.name}
                            onChange={() => setDirty('name')}
                            disabled={isPending}
                            required
                            maxLength={128}
                            className="input"
                            aria-labelledby="name-error"
                        />
                    </label>
                    <div id="name-error" aria-live="polite" aria-atomic>
                        {state.errors?.name &&
                            !dirtyFields.has('name') &&
                            state.errors.name.map((error) => (
                                <p className="py-1 text-xs text-red-800" key={error}>
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>
                <div>
                    <label className="flex justify-between">
                        <span className="text-sm">Rendszeres játékos</span>
                        <input
                            type="checkbox"
                            name="regular"
                            defaultChecked={state?.state?.regular ?? true}
                            onChange={() => setDirty('regular')}
                            disabled={isPending}
                            className="disabled:cursor-not-allowed"
                            aria-labelledby="regular-error"
                        />
                    </label>
                    <div id="regular-error" aria-live="polite" aria-atomic>
                        {state.errors?.regular &&
                            !dirtyFields.has('regular') &&
                            state.errors.regular.map((error) => (
                                <p className="py-1 text-xs text-red-800" key={error}>
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>
                {!dirtyFields.size &&
                    state.globalErrors?.map((error) => (
                        <div className="text-red-800" key={error}>
                            {error}
                        </div>
                    ))}
                <div className="flex justify-center gap-2">
                    <button type="submit" disabled={isPending} className="interactivity interactivity-normal">
                        Mentés
                    </button>
                    <button type="button" onClick={close} className="interactivity interactivity-normal">
                        Mégse
                    </button>
                </div>
            </form>
        </div>
    );
}
