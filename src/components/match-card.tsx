import { MatchDto } from '@/dtos/match-dto';
import { formatDateTime, formatNumberMinMaxDigits } from '@/utility';
import { ArrowDownIcon, ArrowUpIcon, CircleIcon } from '@phosphor-icons/react/dist/ssr';
import { Chivo_Mono } from 'next/font/google';
import Link from 'next/link';
import { Fragment, JSX } from 'react';
import { Card } from './card';
import { DeleteMatchButton } from './delete-match-button';
import { EditMatchButton } from './edit-match-button';

export const chivoMonoFont = Chivo_Mono({ weight: '400', subsets: ['latin'] });

export function MatchCard({ match }: { match: MatchDto }): JSX.Element {
    const date = new Date(match.date);
    return (
        <Card className="flex flex-col justify-between gap-1 sm:gap-2">
            <div>
                <div className="flex justify-center gap-x-4">
                    <div className="text-center">{formatDateTime(date)}</div>
                    <div className="text-center">{match.location}</div>
                </div>
                <div className="flex items-center">
                    <div
                        className={`${chivoMonoFont.className} order-2 flex grow-1 text-4xl`}
                        aria-label={`Eredmény: ${match.team[0].score}-${match.team[1].score}`}
                    >
                        <span className="w-1/2 text-right" aria-hidden="true">
                            {match.team[0].score}
                        </span>
                        <span className="px-2" aria-hidden="true">
                            -
                        </span>
                        <span className="w-1/2" aria-hidden="true">
                            {match.team[1].score}
                        </span>
                    </div>
                    <div className="order-1">
                        <EditMatchButton />
                    </div>
                    <div className="order-3">
                        <DeleteMatchButton />
                    </div>
                </div>
                <div className="grid grid-flow-col grid-cols-2 items-stretch gap-x-2 gap-y-1">
                    {match.team.map((t, i) => (
                        <Fragment key={i}>
                            <div key={i} className="absolute -top-100 h-[1px] w-[1px] overflow-hidden">
                                {i === 0 ? 1 : 2}. csapat
                            </div>
                            {t.teamPlayer.map((p) => (
                                <div
                                    className={`flex items-center justify-between rounded-md border-1 p-1 ${i === 0 ? 'col-1' : 'col-2'}`}
                                    key={p.playerId}
                                >
                                    <Link
                                        href={`/players/${p.playerId}`}
                                        className={`text-sky-800 hover:text-sky-600 ${i === 0 ? 'order-2 text-right' : 'order-1'}`}
                                    >
                                        {p.name}
                                    </Link>
                                    <div
                                        className={`flex items-center gap-1 ${i === 0 ? 'order-1 flex-wrap' : 'order-2 flex-wrap-reverse justify-end'}`}
                                    >
                                        <div
                                            className={`w-10 rounded-sm border-1 text-center text-sm ${i === 0 ? 'order-1' : 'order-2'}`}
                                            aria-label={`Pontszám: ${formatNumberMinMaxDigits(p.beforeRating, 1)}`}
                                        >
                                            <div aria-hidden="true">{formatNumberMinMaxDigits(p.beforeRating, 1)}</div>
                                        </div>
                                        <div
                                            className={`${i === 0 ? 'order-2' : 'order-1'}`}
                                            title={formatNumberMinMaxDigits(p.ratingChange, 2, true)}
                                            aria-label={`Változás: ${formatNumberMinMaxDigits(p.ratingChange, 2)}`}
                                        >
                                            {p.ratingChange > 0 && <ArrowUpIcon className="text-green-600" />}
                                            {p.ratingChange === 0 && <CircleIcon className="text-yellow-600" />}
                                            {p.ratingChange < 0 && <ArrowDownIcon className="text-red-600" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Fragment>
                    ))}
                </div>
            </div>
            <div
                className={`${chivoMonoFont.className} flex justify-center text-xl`}
                aria-label={`Esélyek: ${(match.team[0].chance * 100).toFixed()}% - ${(match.team[1].chance * 100).toFixed()}%`}
            >
                <div className="w-1/2 text-right" aria-hidden="true">
                    {(match.team[0].chance * 100).toFixed()}%
                </div>
                <div className="px-2" aria-hidden="true">
                    -
                </div>
                <div className="w-1/2" aria-hidden="true">
                    {(match.team[1].chance * 100).toFixed()}%
                </div>
            </div>
        </Card>
    );
}
