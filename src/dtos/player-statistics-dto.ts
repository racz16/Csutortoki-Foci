import { StatisticDto } from './statistic-dto';

export interface PlayerStatisticsDto {
    id: number;
    name: string;
    matchCount: number;
    regular: boolean;
    statistics: StatisticDto[];
}
