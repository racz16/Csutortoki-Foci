import { PlayerStatisticsDto } from '@/dtos/player-statistics-dto';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { JSX } from 'react';
import { DeletePlayerButton } from './buttons/delete-player-button';
import { EditPlayerButton } from './buttons/edit-player-button';
import { Card } from './card';
import { StatisticCard } from './statistic-card';

export function RandomPlayerCard({ playerStatistics }: { playerStatistics: PlayerStatisticsDto }): JSX.Element {
    return (
        <Card className="h-full">
            <div className="flex h-full grow flex-col gap-1 sm:gap-2">
                <div className="flex justify-between">
                    <h3 className="order-2 text-center text-lg">
                        <Link href={`/players/${playerStatistics.id}`} className="link">
                            {playerStatistics.name}
                        </Link>
                    </h3>
                    <div className="order-1">
                        <EditPlayerButton
                            id={playerStatistics.id}
                            name={playerStatistics.name}
                            regular={playerStatistics.regular}
                        />
                    </div>
                    <div className="order-3">
                        <DeletePlayerButton
                            id={playerStatistics.id}
                            name={playerStatistics.name}
                            matchCount={playerStatistics.matchCount}
                        />
                    </div>
                </div>
                <div className="flex grow gap-1 sm:gap-2">
                    <div className="glass-nested hidden aspect-[9/16] h-full items-center justify-center rounded-lg lg:flex">
                        <UserCircleIcon size={64} weight="thin" alt="" />
                    </div>
                    <div className="flex w-full flex-col gap-1 sm:gap-2">
                        <div className="grid grow grid-cols-2 gap-1 sm:gap-2">
                            {playerStatistics.statistics.map((s, i) => (
                                <StatisticCard
                                    statistic={s}
                                    size="small"
                                    className={`row-span-3 grid grid-rows-subgrid gap-1 ${i === playerStatistics.statistics.length - 1 ? 'col-span-2' : ''}`}
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
