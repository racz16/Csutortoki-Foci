import { TeamPlayerDto } from '@/dtos/team-player-dto';
import { ArrowDownIcon, ArrowUpIcon, CircleIcon } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { JSX } from 'react';

export function MatchCardPlayerRow({
    player1,
    player2,
}: {
    player1?: TeamPlayerDto;
    player2?: TeamPlayerDto;
}): JSX.Element {
    return (
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
            <div className="flex items-center justify-between">
                {player1 && (
                    <>
                        <div className="flex items-center gap-1">
                            <div className="w-10 rounded-sm border-1 text-center text-sm">
                                {player1.beforeRating.toLocaleString('hu', {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1,
                                })}
                            </div>
                            <div
                                title={player1.ratingChange.toLocaleString('hu', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                    signDisplay: 'always',
                                })}
                            >
                                {player1.ratingChange > 0 && <ArrowUpIcon className="text-green-600" />}
                                {player1.ratingChange === 0 && <CircleIcon className="text-yellow-600" />}
                                {player1.ratingChange < 0 && <ArrowDownIcon className="text-red-600" />}
                            </div>
                        </div>
                        <Link
                            className="text-right text-sky-800 hover:text-sky-600"
                            href={`/players/${player1.playerId}`}
                        >
                            {player1.name}
                        </Link>
                    </>
                )}
            </div>
            <div className="flex items-center justify-between">
                {player2 && (
                    <>
                        <Link className="text-sky-800 hover:text-sky-600" href={`/players/${player2.playerId}`}>
                            {player2.name}
                        </Link>
                        <div className="flex items-center gap-1">
                            <div
                                title={player2.ratingChange.toLocaleString('hu', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                    signDisplay: 'always',
                                })}
                            >
                                {player2.ratingChange > 0 && <ArrowUpIcon className="text-green-600" />}
                                {player2.ratingChange === 0 && <CircleIcon className="text-yellow-600" />}
                                {player2.ratingChange < 0 && <ArrowDownIcon className="text-red-600" />}
                            </div>
                            <div className="w-10 rounded-sm border-1 text-center text-sm">
                                {player2.beforeRating.toLocaleString('hu', {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1,
                                })}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
