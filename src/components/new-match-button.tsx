'use client';

import { isAdmin } from '@/utility';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

export function NewMatchButton(): JSX.Element {
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => alert('Új meccs')}
            className="cursor-pointer rounded-md border-1 p-1 text-sky-800 hover:bg-sky-600 hover:text-white"
        >
            Új meccs
        </button>
    );
}
