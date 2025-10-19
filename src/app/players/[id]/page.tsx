import { DeletePlayerButton } from '@/components/buttons/delete-player-button';
import { EditPlayerButton } from '@/components/buttons/edit-player-button';
import { Card } from '@/components/card';
import { Matches } from '@/components/matches';
import { MatchesSkeleton } from '@/components/skeletons/matches-skeleton';
import { PlayerStatisticsSkeleton } from '@/components/skeletons/player-statistics-skeleton';
import { StatisticCard } from '@/components/statistic-card';
import { getMatches } from '@/logic/matches';
import { prismaClient } from '@/logic/prisma';
import { getPlayerStatistics } from '@/logic/statistics';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr';
import { JSX, Suspense } from 'react';

export async function generateStaticParams(): Promise<{ id: string }[]> {
    if (process.env.PREVENT_PRERENDERING) {
        return [];
    }
    const players = await prismaClient.player.findMany({ omit: { mu: true, sigma: true, name: true, regular: true } });
    return players.map((p) => ({ id: p.id.toFixed() }));
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }): Promise<JSX.Element> {
    const playerId = +(await params).id;
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <Suspense fallback={<PlayerStatisticsSkeleton />}>
                <PlayerStatisticsLazy playerId={playerId} />
            </Suspense>
            <section className="flex flex-col gap-2 sm:gap-4">
                <h3 className="mt-1 text-lg sm:mt-2">Meccsek</h3>
                <Suspense fallback={<MatchesSkeleton />}>
                    <MatchesLazy playerId={playerId} />
                </Suspense>
            </section>
        </div>
    );
}

async function PlayerStatisticsLazy({ playerId }: { playerId: number }): Promise<JSX.Element | JSX.Element[]> {
    const playerStatistics = await getPlayerStatistics(playerId);
    return (
        <>
            <div className="flex h-8.5 items-center justify-between">
                <h2 className="text-xl">{playerStatistics.name}</h2>
                {!playerStatistics.regular && <div className="text-xs text-gray-500">Nem rendszeres játékos</div>}
                <div className="flex gap-2">
                    <EditPlayerButton />
                    <DeletePlayerButton matchCount={playerStatistics.matchCount} />
                </div>
            </div>
            {playerStatistics.regular &&
                (playerStatistics.statistics.length ? (
                    <div className="grid grid-cols-2 grid-rows-21 gap-2 sm:grid-cols-4 sm:grid-rows-9 sm:gap-4">
                        <Card className="col-span-2 row-span-6 flex items-end justify-center sm:col-span-1 lg:row-span-9">
                            <div className="flex aspect-[9/16] w-50 items-center justify-center">
                                <UserCircleIcon size={64} weight="thin" alt="" />
                            </div>
                        </Card>
                        {playerStatistics.statistics.map((s, i) => (
                            <StatisticCard
                                statistic={s}
                                className={`row-span-3 grid grid-rows-subgrid gap-1 sm:gap-2 ${i === playerStatistics.statistics.length - 1 ? 'col-span-2 lg:col-span-1' : ''}`}
                                key={s.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row">
                        <Card className="flex items-end justify-center">
                            <div className="flex aspect-[9/16] w-50 items-center justify-center">
                                <UserCircleIcon size={64} weight="thin" alt="" />
                            </div>
                        </Card>
                        <div className="flex w-full items-center justify-center p-2">
                            <h3 className="text-center text-lg">Még nincsenek statisztikák</h3>
                        </div>
                    </div>
                ))}
        </>
    );
}

async function MatchesLazy({ playerId }: { playerId: number }): Promise<JSX.Element> {
    const matches = await getMatches(undefined, playerId);
    return <Matches initialMatches={matches} playerId={playerId} />;
}
