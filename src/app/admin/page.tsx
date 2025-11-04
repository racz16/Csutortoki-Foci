'use client';

import { revalidatePathEndpoint, updateAllEndpoint, updateLastEndpoint } from '@/actions';
import { LoadingIndicator } from '@/components/loading-indicator';
import { isAdmin } from '@/utility';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { JSX } from 'react';

export default function AdminPage(): JSX.Element {
    const session = useSession();
    if (session.status === 'loading') {
        return (
            <div className="flex h-full items-center justify-center">
                <LoadingIndicator size={64} />
            </div>
        );
    }
    if (!isAdmin(session)) {
        redirect('/not-found');
    }
    return (
        <div className="flex h-full flex-col items-center justify-center gap-2 sm:gap-4">
            <h2 className="text-bg text-xl">Admin funkciók</h2>
            <button
                onClick={async () => {
                    await updateAllEndpoint();
                    alert('Összes meccs frissítve');
                }}
                className="interactivity interactivity-normal"
            >
                Összes meccs frissítése
            </button>
            <button
                onClick={async () => {
                    await updateLastEndpoint();
                    alert('Utolsó meccs frissítve');
                }}
                className="interactivity interactivity-normal"
            >
                Utolsó meccs frissítése
            </button>
            <h3 className="text-bg text-lg">Cache invalidálás</h3>
            <button
                onClick={async () => {
                    await revalidatePathEndpoint('/');
                    alert('Főoldal cache invalidálva');
                }}
                className="interactivity interactivity-normal"
            >
                Főoldal
            </button>
            <button
                onClick={async () => {
                    await revalidatePathEndpoint('/matches');
                    alert('Meccsek cache invalidálva');
                }}
                className="interactivity interactivity-normal"
            >
                Meccsek
            </button>
            <button
                onClick={async () => {
                    await revalidatePathEndpoint('/players');
                    alert('Játékosok cache invalidálva');
                }}
                className="interactivity interactivity-normal"
            >
                Játékosok
            </button>
            <button
                onClick={async () => {
                    await revalidatePathEndpoint('/players/[id]', 'page');
                    alert('Játékos profilok cache invalidálva');
                }}
                className="interactivity interactivity-normal"
            >
                Játékos profilok
            </button>
        </div>
    );
}
