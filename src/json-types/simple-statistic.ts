export interface SimpleStatistic {
    type: 'simple';
    name: string;
    value: string;
    details?: string;
    extraDetails?: string;
    extraDetailsTooltip?: string;
}
