import { MatchDto } from '@/dtos/match-dto';
import { formatDateTime, formatNumberMinMaxDigits } from '@/utility';
import { Chivo_Mono } from 'next/font/google';
import Link from 'next/link';
import { Fragment, JSX } from 'react';
import { DeleteMatchButton } from './buttons/delete-match-button';
import { EditMatchButton } from './buttons/edit-match-button';
import { Card } from './card';

export const chivoMonoFont = Chivo_Mono({ weight: '400', subsets: ['latin'] });

export function MatchCard({ match, playerId }: { match: MatchDto; playerId?: number }): JSX.Element {
    const date = new Date(match.date);
    return (
        <Card className="flex h-full flex-col justify-between gap-1 sm:gap-2">
            <div>
                <div className="flex justify-center gap-x-4">
                    <div className="text-center">{formatDateTime(date)}</div>
                    <div className="text-center">{match.location}</div>
                </div>
                <div className="flex items-center">
                    <div
                        className={`${chivoMonoFont.className} order-2 flex grow text-4xl`}
                        aria-label={`Eredmény: ${match.team[0].score}-${match.team[1].score}`}
                    >
                        <span className="w-1/2 text-right" aria-hidden>
                            {match.team[0].score}
                        </span>
                        <span className="px-2" aria-hidden>
                            -
                        </span>
                        <span className="w-1/2" aria-hidden>
                            {match.team[1].score}
                        </span>
                    </div>
                    <div className="order-1">
                        <EditMatchButton match={match} />
                    </div>
                    <div className="order-3">
                        <DeleteMatchButton id={match.id} />
                    </div>
                </div>
                <div className="grid grid-flow-col grid-cols-2 items-stretch gap-x-2 gap-y-1">
                    {match.team.map((t, i) => (
                        <Fragment key={i}>
                            <div key={i} className="sr-only">
                                {i === 0 ? 1 : 2}. csapat
                            </div>
                            {i === 0
                                ? t.teamPlayer.map((p) => (
                                      <div
                                          className={`col-1 flex items-center justify-between rounded-md p-1 ${p.playerId === playerId ? 'glass-selected' : 'glass-nested'}`}
                                          key={p.playerId}
                                      >
                                          <div className="flex flex-wrap items-center gap-1">
                                              <div
                                                  className="w-8 rounded-sm bg-sky-900/50 text-center text-sm text-white"
                                                  aria-hidden
                                              >
                                                  {formatNumberMinMaxDigits(p.beforeRating, 1)}
                                              </div>
                                              <div
                                                  className={`w-8 rounded-sm text-center text-sm text-white ${p.beforeRating === p.afterRating ? 'bg-yellow-900/50' : p.beforeRating > p.afterRating ? 'bg-red-900/50' : 'bg-green-900/50'}`}
                                                  aria-hidden
                                              >
                                                  {formatNumberMinMaxDigits(p.afterRating, 1)}
                                              </div>
                                          </div>
                                          <Link
                                              href={`/players/${p.playerId}`}
                                              className={`link text-right ${p.playerId === playerId ? 'font-bold' : ''}`}
                                          >
                                              {p.name}
                                          </Link>
                                          <div className="sr-only">
                                              Pontszám a meccs előtt: {formatNumberMinMaxDigits(p.beforeRating, 1)}
                                          </div>
                                          <div className="sr-only">
                                              Pontszám a meccs után: {formatNumberMinMaxDigits(p.afterRating, 1)}
                                          </div>
                                      </div>
                                  ))
                                : t.teamPlayer.map((p) => (
                                      <div
                                          className={`col-2 flex items-center justify-between rounded-md p-1 ${p.playerId === playerId ? 'glass-selected' : 'glass-nested'}`}
                                          key={p.playerId}
                                      >
                                          <Link
                                              href={`/players/${p.playerId}`}
                                              className={`link ${p.playerId === playerId ? 'font-bold' : ''}`}
                                          >
                                              {p.name}
                                          </Link>
                                          <div className="flex flex-wrap-reverse items-center justify-end gap-1">
                                              <div
                                                  className={`w-8 rounded-sm text-center text-sm text-white ${p.beforeRating === p.afterRating ? 'bg-yellow-900/50' : p.beforeRating > p.afterRating ? 'bg-red-900/50' : 'bg-green-900/50'}`}
                                                  aria-hidden
                                              >
                                                  {formatNumberMinMaxDigits(p.afterRating, 1)}
                                              </div>
                                              <div
                                                  className="w-8 rounded-sm bg-sky-900/50 text-center text-sm text-white"
                                                  aria-hidden
                                              >
                                                  {formatNumberMinMaxDigits(p.beforeRating, 1)}
                                              </div>
                                          </div>
                                          <div className="sr-only">
                                              Pontszám a meccs előtt: {formatNumberMinMaxDigits(p.beforeRating, 1)}
                                          </div>
                                          <div className="sr-only">
                                              Pontszám a meccs után: {formatNumberMinMaxDigits(p.afterRating, 1)}
                                          </div>
                                      </div>
                                  ))}
                        </Fragment>
                    ))}
                </div>
            </div>
            <div className="flex items-center justify-around">
                <div
                    className="w-1/2 text-center text-xl"
                    aria-label={`1. csapat esélye: ${(match.team[0].chance * 100).toFixed()}%`}
                >
                    <div aria-hidden>{(match.team[0].chance * 100).toFixed()}%</div>
                </div>
                <div className="px-2 text-sm" aria-hidden>
                    Esélyek
                </div>
                <div
                    className="w-1/2 text-center text-xl"
                    aria-label={`2. csapat esélye: ${(match.team[1].chance * 100).toFixed()}%`}
                >
                    <div aria-hidden>{(match.team[1].chance * 100).toFixed()}%</div>
                </div>
            </div>
        </Card>
    );
}
