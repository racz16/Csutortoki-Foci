import { NewPlayerButton } from '@/components/new-player-button';
import { PlayersTable } from '@/components/players-table';
import { PlayersTableSkeleton } from '@/components/skeletons/players-table-skeleton';
import { getPlayers } from '@/logic/players';
import { JSX, Suspense } from 'react';

export default async function PlayersPage(): Promise<JSX.Element> {
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex h-8.5 items-center justify-between">
                <h2 className="text-xl">Játékosok</h2>
                <NewPlayerButton />
            </div>
            <Suspense fallback={<PlayersTableSkeleton />}>
                <PlayersLazy />
            </Suspense>
        </div>
    );
}

async function PlayersLazy(): Promise<JSX.Element> {
    const players = await getPlayers();
    return <PlayersTable players={players} />;
}
