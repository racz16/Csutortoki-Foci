import { Matches } from '@/components/matches';
import { MatchesSkeleton } from '@/components/skeletons/matches-skeleton';
import { getMatches } from '@/logic/matches';
import { JSX, Suspense } from 'react';

export default async function MatchesPage(): Promise<JSX.Element> {
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex items-baseline justify-between">
                <h2 className="mt-1 text-xl sm:mt-2">Meccsek</h2>
                {/* <button className="active::text-white rounded-lg border-1 p-1 hover:bg-gray-700 hover:text-white active:bg-black">
                    Meccs létrehozása
                </button> */}
            </div>
            <Suspense fallback={<MatchesSkeleton />}>
                <MatchesLazy />
            </Suspense>
        </div>
    );
}

async function MatchesLazy(): Promise<JSX.Element> {
    const matches = await getMatches();
    return <Matches initialMatches={matches} />;
}
