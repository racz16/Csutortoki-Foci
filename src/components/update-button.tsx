'use client';

import { updateAll, updateLast } from '@/actions';
import { JSX } from 'react';

export function UpdateAllMatchesButton(): JSX.Element {
    return (
        <button
            onClick={updateAll}
            className="cursor-pointer rounded-md border-1 p-1 text-sky-800 hover:bg-sky-600 hover:text-white"
        >
            Összes meccs frissítése
        </button>
    );
}

export function UpdateLastMatchButton(): JSX.Element {
    return (
        <button
            onClick={updateLast}
            className="cursor-pointer rounded-md border-1 p-1 text-sky-800 hover:bg-sky-600 hover:text-white"
        >
            Utolsó meccs frissítése
        </button>
    );
}
