import { JSX } from 'react';
import { MatchCardSkeleton } from './match-card-skeleton';

export function MatchesSkeleton(): JSX.Element {
    const matchPlaceholders = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    return (
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
            {matchPlaceholders.map((m) => (
                <MatchCardSkeleton key={m} />
            ))}
        </div>
    );
}
