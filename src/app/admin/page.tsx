'use client';

import { LoadingIndicator } from '@/components/loading-indicator';
import { UpdateAllMatchesButton, UpdateLastMatchButton } from '@/components/update-button';
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
            <h2 className="text-xl">Admin funkciók</h2>
            <UpdateAllMatchesButton />
            <UpdateLastMatchButton />
        </div>
    );
}
