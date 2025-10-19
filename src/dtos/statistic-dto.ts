export interface StatisticDto {
    id: number;
    name: string;
    value: string;
    valueAriaLabel: string | null;
    details: string | null;
    extraDetails: string | null;
    extraDetailsTooltip: string | null;
}
