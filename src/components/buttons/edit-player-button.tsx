'use client';

import { isAdmin } from '@/utility';
import { PencilIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

export function EditPlayerButton(): JSX.Element {
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => alert('Játékos szerkesztése')}
            className="interactivity interactivity-normal"
            aria-label="Szerkesztés"
        >
            <PencilIcon />
        </button>
    );
}
