import { StatisticDto } from './statistic-dto';

export interface PlayerStatisticsDto {
    id: number;
    name: string;
    statistics: StatisticDto[];
}
