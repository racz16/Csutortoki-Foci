'use client';

import { MatchesDto } from '@/dtos/matches-dto';
import { JSX, useEffect, useRef, useState } from 'react';
import { Card } from './card';
import { LoadingIndicator } from './loading-indicator';
import { MatchCard } from './match-card';

export function Matches({ initialMatches, playerId }: { initialMatches: MatchesDto; playerId?: number }): JSX.Element {
    const [matches, setMatches] = useState(initialMatches);
    const [loading, setLoading] = useState(false);
    const infiniteScrollTarget = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!infiniteScrollTarget.current || !matches.nextDate) {
            return;
        }
        const observer = new IntersectionObserver(async (entry) => {
            if (entry[0].isIntersecting && !loading && matches.nextDate) {
                try {
                    setLoading(true);
                    const params = new URLSearchParams();
                    params.append('nextDate', matches.nextDate);
                    if (playerId) {
                        params.append('playerId', playerId.toFixed());
                    }
                    const response = await fetch(`/api/matches?${params}`);
                    const newMatches: MatchesDto = await response.json();
                    setMatches((m) => ({
                        matches: [...m.matches, ...newMatches.matches],
                        nextDate: newMatches.nextDate,
                    }));
                } finally {
                    setLoading(false);
                }
            }
        });
        observer.observe(infiniteScrollTarget.current);

        return () => {
            observer.disconnect();
        };
    }, [matches, loading, playerId]);

    return (
        <div role="feed">
            {!matches.matches.length && <h3 className="text-bg text-center text-lg">Még nincsenek meccsek</h3>}
            {matches.matches.length > 0 && (
                <>
                    <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                        {matches.matches.map((m) => (
                            <MatchCard match={m} playerId={playerId} key={m.id} />
                        ))}
                    </div>
                    <div ref={infiniteScrollTarget} className="flex justify-center p-2">
                        {loading && (
                            <Card>
                                <LoadingIndicator size={32} />
                            </Card>
                        )}
                        {!matches.nextDate && <div className="text-bg text-sm">Elérted a legkorábbi meccset</div>}
                    </div>
                </>
            )}
        </div>
    );
}
