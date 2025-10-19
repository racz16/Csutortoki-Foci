'use client';

import { updateAll, updateLast } from '@/actions';
import { JSX } from 'react';

export function UpdateAllMatchesButton(): JSX.Element {
    return (
        <button
            onClick={async () => {
                await updateAll();
                alert('Összes meccs frissítve');
            }}
            className="interactivity interactivity-normal"
        >
            Összes meccs frissítése
        </button>
    );
}

export function UpdateLastMatchButton(): JSX.Element {
    return (
        <button
            onClick={async () => {
                await updateLast();
                alert('Utolsó meccs frissítve');
            }}
            className="interactivity interactivity-normal"
        >
            Utolsó meccs frissítése
        </button>
    );
}
