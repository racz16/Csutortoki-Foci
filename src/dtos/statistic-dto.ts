export interface StatisticDto {
    id: number;
    name: string;
    value: string;
    details: string | null;
    extraDetails: string | null;
    extraDetailsTooltip: string | null;
}
