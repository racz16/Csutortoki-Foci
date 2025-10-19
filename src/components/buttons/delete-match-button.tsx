'use client';

import { isAdmin } from '@/utility';
import { TrashIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

export function DeleteMatchButton(): JSX.Element {
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => alert('Meccs törlése')}
            className="interactivity interactivity-danger"
            aria-label="Törlés"
        >
            <TrashIcon />
        </button>
    );
}
