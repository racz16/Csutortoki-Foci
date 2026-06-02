import { StatisticDto } from '@/dtos/statistic-dto';
import { Size } from '@/dtos/types';
import { JSX } from 'react';
import { Card } from './card';

export function StatisticCard({
    statistic,
    className = '',
    size = 'large',
}: {
    statistic: StatisticDto;
    className?: string;
    size?: Size;
}): JSX.Element {
    const stat = statistic.statistic;
    return (
        <Card size={size} className={className}>
            {stat.type === 'simple' && (
                <>
                    <div className="px-1 sm:p-0">{stat.name}</div>
                    <div className="self-center text-center text-3xl">{stat.value}</div>
                    <div className="flex items-center justify-between px-1 text-sm text-gray-800 sm:p-0">
                        <div>{stat.details}</div>
                        {stat.extraDetails && (
                            <div
                                className="glass-nested rounded-md px-1 select-none"
                                title={stat.extraDetailsTooltip ?? undefined}
                            >
                                {stat.extraDetails}
                            </div>
                        )}
                    </div>
                </>
            )}
            {stat.type === 'match-form' && (
                <>
                    <div className="px-1 sm:p-0">Forma</div>
                    <div className="flex items-center justify-evenly gap-1 sm:gap-2">
                        {stat.matches.map((m, i) => (
                            <div className="flex flex-col items-center gap-1" key={i}>
                                <div
                                    className={`flex ${i === stat.matches.length - 1 ? 'h-15 w-15 text-2xl' : 'my-2.5 h-10 w-10'} items-center justify-center rounded-full text-white ${m.result === 'win' ? 'bg-green-900/50' : m.result === 'loss' ? 'bg-red-900/50' : 'bg-yellow-900/50'}`}
                                    aria-label={`${m.result === 'win' ? 'Győzelem' : m.result === 'loss' ? 'Vereség' : 'Döntetlen'}`}
                                >
                                    <div aria-hidden>{m.result === 'win' ? 'GY' : m.result === 'loss' ? 'V' : 'D'}</div>
                                </div>
                                <div className="text-sm text-gray-700">
                                    {m.scores[0]} - {m.scores[1]}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between px-1 text-sm text-gray-800 sm:p-0">
                        <div>Az utolsó 5 meccsen</div>
                    </div>
                </>
            )}
        </Card>
    );
}
