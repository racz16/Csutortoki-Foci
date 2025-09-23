'use client';

import { updateAll, updateLast } from '@/actions';
import { JSX } from 'react';

export function UpdateAllMatchesButton(): JSX.Element {
    return (
        <button
            onClick={updateAll}
            className="rounded-md border-1 p-2 hover:bg-black hover:text-white active:bg-gray-700"
        >
            Update all matches
        </button>
    );
}

export function UpdateLastMatchButton(): JSX.Element {
    return (
        <button
            onClick={updateLast}
            className="rounded-md border-1 p-2 hover:bg-black hover:text-white active:bg-gray-700"
        >
            Update last match
        </button>
    );
}
