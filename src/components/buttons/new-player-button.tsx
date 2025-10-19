'use client';

import { isAdmin } from '@/utility';
import { PlusIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

export function NewPlayerButton(): JSX.Element {
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => alert('Játékos létrehozása')}
            className="interactivity interactivity-normal"
            aria-label="Létrehozás"
        >
            <PlusIcon weight="bold" />
        </button>
    );
}
