import { PlayerStatisticsDto } from '@/dtos/player-statistics-dto';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { JSX } from 'react';
import { Card } from './card';
import { StatisticCard } from './statistic-card';

export function RandomPlayerCard({ playerStatistics }: { playerStatistics: PlayerStatisticsDto }): JSX.Element {
    return (
        <Card>
            <div className="flex h-full grow flex-col gap-1 sm:gap-2">
                <h3 className="text-center text-lg">
                    <Link href={`/players/${playerStatistics.id}`} className="text-sky-800 hover:text-sky-600">
                        {playerStatistics.name}
                    </Link>
                </h3>
                <div className="flex grow gap-1 sm:gap-2">
                    <div className="hidden aspect-[9/16] h-full items-center justify-center rounded-lg border-1 lg:flex">
                        <UserCircleIcon width={64} height={64} weight="thin" alt="" />
                    </div>
                    <div className="flex w-full flex-col gap-1 sm:gap-2">
                        <div className="grid grow grid-cols-2 gap-1 sm:gap-2">
                            {playerStatistics.statistics.map((s) => (
                                <StatisticCard
                                    statistic={s}
                                    size="small"
                                    className="row-span-3 grid grid-rows-subgrid gap-1"
                                    key={s.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
