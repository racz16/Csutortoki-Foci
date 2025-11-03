'use client';

import { createPlayerEndpoint, editPlayerEndpoint } from '@/actions';
import { XIcon } from '@phosphor-icons/react';
import { ChangeEvent, JSX, RefObject, useActionState, useRef, useState } from 'react';

export function PlayerDialog({
    id,
    name = '',
    regular = true,
    dialogRef,
}: {
    id?: number;
    name?: string;
    regular?: boolean;
    dialogRef: RefObject<HTMLDialogElement | null>;
}): JSX.Element {
    const playerAction = id ? editPlayerEndpoint.bind(null, id) : createPlayerEndpoint;
    const [state, action, isPending] = useActionState(playerAction, null);
    const [formContent, setFormContent] = useState({ name, regular });
    const formRef = useRef<HTMLFormElement | null>(null);

    function toggle(): void {
        setFormContent({ name, regular });
        if (state) {
            state.errors = undefined;
            state.globalErrors = undefined;
        }
        formRef.current?.reset();
    }

    function nameChanged(event: ChangeEvent<HTMLInputElement>): void {
        if (state?.errors?.name) {
            state.errors.name = undefined;
        }
        setFormContent((formContent) => ({ ...formContent, name: event.target.value }));
    }

    function regularChanged(event: ChangeEvent<HTMLInputElement>): void {
        if (state?.errors?.regular) {
            state.errors.regular = undefined;
        }
        setFormContent((formContent) => ({ ...formContent, regular: event.target.checked }));
    }

    return (
        <dialog ref={dialogRef} onToggle={toggle} className="dialog glass-dialog">
            <div className="flex flex-col gap-2 sm:gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl">{id ? 'Játékos szerkesztése' : 'Játékos létrehozása'}</h2>
                    <button
                        onClick={() => dialogRef.current?.close()}
                        className="interactivity interactivity-normal"
                        aria-label="Felugró ablak bezárása"
                    >
                        <XIcon />
                    </button>
                </div>
                <form ref={formRef} action={action} className="flex flex-col gap-1 sm:gap-2">
                    <div>
                        <label>
                            <div className="text-sm">
                                Név<span className="text-red-800">*</span>
                            </div>
                            <input
                                name="name"
                                defaultValue={formContent.name}
                                onChange={(e) => nameChanged(e)}
                                disabled={isPending}
                                className="w-full rounded-sm border-1 border-white/25 bg-white/50 p-1 disabled:cursor-not-allowed disabled:bg-gray-500/25"
                                aria-labelledby="name-error"
                            />
                        </label>
                        <div id="name-error" aria-live="polite" aria-atomic="true">
                            {state?.errors?.name &&
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
                                defaultChecked={formContent.regular}
                                onChange={(e) => regularChanged(e)}
                                disabled={isPending}
                                className="disabled:cursor-not-allowed"
                                aria-labelledby="regular-error"
                            />
                        </label>
                        <div id="regular-error" aria-live="polite" aria-atomic="true">
                            {state?.errors?.regular &&
                                state.errors.regular.map((error) => (
                                    <p className="py-1 text-xs text-red-800" key={error}>
                                        {error}
                                    </p>
                                ))}
                        </div>
                    </div>
                    {state?.globalErrors?.map((error) => (
                        <div className="text-red-800" key={error}>
                            {error}
                        </div>
                    ))}
                    <div className="flex justify-center gap-2">
                        <button type="submit" disabled={isPending} className="interactivity interactivity-normal">
                            Mentés
                        </button>
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            className="interactivity interactivity-normal"
                        >
                            Mégse
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
