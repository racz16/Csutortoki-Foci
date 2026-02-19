import { NewMatchButton } from '@/components/buttons/new-match-button';
import { Matches } from '@/components/matches';
import { ButtonSkeleton } from '@/components/skeletons/button-skeleton';
import { MatchesSkeleton } from '@/components/skeletons/matches-skeleton';
import { getMatches } from '@/logic/matches';
import { getPlayerCount } from '@/logic/players';
import { JSX, Suspense } from 'react';

export default function MatchesPage(): JSX.Element {
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="flex h-8.5 items-center justify-between">
                <h2 className="text-bg text-xl">Meccsek</h2>
                <Suspense fallback={<ButtonSkeleton />}>
                    <NewMatchButtonLazy />
                </Suspense>
            </div>
            <Suspense fallback={<MatchesSkeleton />}>
                <MatchesLazy />
            </Suspense>
        </div>
    );
}

async function NewMatchButtonLazy(): Promise<JSX.Element> {
    const playerCount = await getPlayerCount();
    return <NewMatchButton playerCount={playerCount} />;
}

async function MatchesLazy(): Promise<JSX.Element> {
    const matches = await getMatches();
    return <Matches initialMatches={matches} />;
}
