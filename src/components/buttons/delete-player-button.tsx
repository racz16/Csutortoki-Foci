'use client';

import { isAdmin } from '@/utility';
import { TrashIcon } from '@phosphor-icons/react';
import { useSession } from 'next-auth/react';
import { JSX } from 'react';

export function DeletePlayerButton({ matchCount }: { matchCount: number }): JSX.Element {
    const session = useSession();
    if (!isAdmin(session)) {
        return <></>;
    }
    return (
        <button
            onClick={() => alert('Játékos törlése')}
            className="interactivity interactivity-danger"
            disabled={matchCount > 0}
            title={matchCount > 0 ? 'Csak a meccs nélküli játékosok törölhetők' : undefined}
            aria-label="Törlés"
        >
            <TrashIcon />
        </button>
    );
}
