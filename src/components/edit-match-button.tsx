'use client';

import { isAdmin } from '@/utility';
import { PencilIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

export function EditMatchButton(): JSX.Element {
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => alert('Meccs szerkesztése')}
            className="cursor-pointer text-sky-800 hover:text-sky-600"
            aria-label="Szerkesztés"
        >
            <PencilIcon size={16} />
        </button>
    );
}
