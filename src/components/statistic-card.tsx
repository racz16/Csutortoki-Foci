import { StatisticDto } from '@/dtos/statistic-dto';
import { JSX } from 'react';
import { Card } from './card';

export function StatisticCard({
    statistic,
    className = '',
    size = 'large',
}: {
    statistic: StatisticDto;
    className?: string;
    size?: 'small' | 'large';
}): JSX.Element {
    return (
        <Card size={size} className={className}>
            <div className="px-1 sm:p-0">{statistic.name}</div>
            <div className="self-center text-center text-3xl">{statistic.value}</div>
            <div className="flex items-center justify-between px-1 text-sm text-gray-600 sm:p-0">
                <div>{statistic.details}</div>
                {statistic.extraDetails && (
                    <div
                        className="rounded-md border-1 px-1 select-none"
                        title={statistic.extraDetailsTooltip ? statistic.extraDetailsTooltip : undefined}
                    >
                        {statistic.extraDetails}
                    </div>
                )}
            </div>
        </Card>
    );
}
