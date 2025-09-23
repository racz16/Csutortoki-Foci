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
            <div>{statistic.name}</div>
            <div className="self-center text-center text-3xl">{statistic.value}</div>
            <div className="text-sm text-gray-600">{statistic.detail}</div>
        </Card>
    );
}
