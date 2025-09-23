import { MatchCard } from '@/components/match-card';
import { GlobalStatisticsSkeleton } from '@/components/skeletons/global-statistics-skeleton';
import { MatchCardSkeleton } from '@/components/skeletons/match-card-skeleton';
import { PlayerStatisticsCardSkeleton } from '@/components/skeletons/player-statistics-card-skeleton';
import { StatisticCard } from '@/components/statistic-card';
import { getLastMatch } from '@/logic/matches';
import { getGeneralStatistics } from '@/logic/statistics';
import { JSX, ReactNode, Suspense } from 'react';

export default async function MainPage({ randomPlayer }: { randomPlayer: ReactNode }): Promise<JSX.Element> {
    return (
        <div className="flex flex-col gap-2 sm:gap-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                <section className="flex flex-col gap-2 sm:grid-cols-2 sm:gap-4">
                    <h2 className="mt-1 text-xl sm:mt-2">Utolsó meccs</h2>
                    <Suspense fallback={<MatchCardSkeleton />}>
                        <LastMatchLazy />
                    </Suspense>
                </section>
                <section className="flex flex-col gap-2 sm:grid-cols-2 sm:gap-4">
                    <h2 className="mt-1 text-xl sm:mt-2">Véletlen játékos</h2>
                    <Suspense fallback={<PlayerStatisticsCardSkeleton />}>{randomPlayer}</Suspense>
                </section>
            </div>
            <section className="flex flex-col gap-2 sm:gap-4">
                <div className="flex items-baseline justify-between">
                    <h2 className="mt-1 text-xl sm:mt-2">Statisztikák</h2>
                    <legend className="text-center text-xs text-gray-500">
                        A statisztikák 2025. júliusa óta értendők
                    </legend>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
                    <Suspense fallback={<GlobalStatisticsSkeleton />}>
                        <GlobalStatisticsLazy />
                    </Suspense>
                    {/* <div className="flex flex-col items-center justify-around">
                        <UpdateAllMatchesButton />
                        <UpdateLastMatchButton />
                    </div> */}
                </div>
            </section>
        </div>
    );
}

async function LastMatchLazy(): Promise<JSX.Element> {
    const match = await getLastMatch();
    return <MatchCard match={match} />;
}

async function GlobalStatisticsLazy(): Promise<JSX.Element[]> {
    const statistics = await getGeneralStatistics();
    return statistics.map((s) => (
        <StatisticCard statistic={s} className="row-span-3 grid grid-rows-subgrid gap-1 sm:gap-2" key={s.id} />
    ));
}
