import { PlayersTable } from '@/components/players-table';
import { PlayersTableSkeleton } from '@/components/skeletons/players-table-skeleton';
import { getPlayers } from '@/logic/players';
import { JSX, Suspense } from 'react';

export default async function PlayersPage(): Promise<JSX.Element> {
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-baseline justify-between">
                <h2 className="mt-1 text-xl sm:mt-2">Játékosok</h2>
                {/* <button className="active::text-white rounded-lg border-1 p-1 hover:bg-gray-700 hover:text-white active:bg-black">
                    Játékos létrehozása
                 </button> */}
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
