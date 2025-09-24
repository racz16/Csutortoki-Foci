import { MatchDto } from '@/dtos/match-dto';
import { Chivo_Mono } from 'next/font/google';
import { JSX } from 'react';
import { Card } from './card';
import { MatchCardPlayerRow } from './match-card-player-row';

export const chivoMonoFont = Chivo_Mono({ weight: '400', subsets: ['latin'] });

export function MatchCard({ match }: { match: MatchDto }): JSX.Element {
    const largerTeamIndex = match.team[0].teamPlayer.length > match.team[1].teamPlayer.length ? 0 : 1;
    const date = new Date(match.date);
    return (
        <Card className="flex flex-col justify-between gap-1 sm:gap-2">
            <div>
                <div className="text-center">{date.toLocaleDateString('hu')}</div>
                <div className={`${chivoMonoFont.className} flex justify-center text-4xl`}>
                    <div className="w-1/2 text-right">{match.team[0].score}</div>
                    <div className="px-2">-</div>
                    <div className="w-1/2">{match.team[1].score}</div>
                </div>
                <div className="flex flex-col justify-center gap-1">
                    {match.team[largerTeamIndex].teamPlayer.map((_, i) => (
                        <MatchCardPlayerRow
                            player1={match.team[0].teamPlayer[i]}
                            player2={match.team[1].teamPlayer[i]}
                            key={i}
                        ></MatchCardPlayerRow>
                    ))}
                </div>
            </div>
            <div className={`${chivoMonoFont.className} flex justify-center text-xl`}>
                <div className="w-1/2 text-right">{(match.team[0].chance * 100).toFixed()}%</div>
                <div className="px-2">-</div>
                <div className="w-1/2">{(match.team[1].chance * 100).toFixed()}%</div>
            </div>
        </Card>
    );
}
