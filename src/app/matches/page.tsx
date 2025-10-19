import { NewMatchButton } from '@/components/buttons/new-match-button';
import { Matches } from '@/components/matches';
import { MatchesSkeleton } from '@/components/skeletons/matches-skeleton';
import { getMatches } from '@/logic/matches';
import { JSX, Suspense } from 'react';

export default async function MatchesPage(): Promise<JSX.Element> {
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex h-8.5 items-center justify-between">
                <h2 className="text-xl">Meccsek</h2>
                <NewMatchButton />
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
