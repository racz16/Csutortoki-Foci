'use client';

import { PlayerDevelopmentDto } from '@/dtos/player-development-dto';
import { chivoMonoFont, formatDateTime, formatNumberMinMaxDigits } from '@/utility';
import { ArrowRightIcon } from '@phosphor-icons/react';
import {
    ComposeOption,
    DataZoomComponentOption,
    GridComponentOption,
    LineSeriesOption,
    MarkPointComponentOption,
    ToolboxComponentOption,
    TooltipComponentOption,
} from 'echarts';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { LineChart } from 'echarts/charts';
import {
    DataZoomComponent,
    GridComponent,
    MarkPointComponent,
    ToolboxComponent,
    TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import hu from 'echarts/i18n/langHU-obj';
import { CanvasRenderer } from 'echarts/renderers';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { ordinal } from 'openskill';
import { JSX } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Card } from './card';

export function PlayerChart({ development }: { development: PlayerDevelopmentDto[] }): JSX.Element {
    if (!development.length) {
        return <h4 className="text-bg text-center text-lg">Még nincsenek meccsek</h4>;
    }

    echarts.use([
        TooltipComponent,
        GridComponent,
        LineChart,
        CanvasRenderer,
        MarkPointComponent,
        DataZoomComponent,
        ToolboxComponent,
    ]);
    echarts.registerLocale('HU', hu);

    type EChartsOption = ComposeOption<
        | TooltipComponentOption
        | GridComponentOption
        | MarkPointComponentOption
        | DataZoomComponentOption
        | ToolboxComponentOption
        | LineSeriesOption
    >;

    const option: EChartsOption = {
        toolbox: {
            feature: {
                restore: {
                    iconStyle: { borderColor: '#005986' },
                    emphasis: { iconStyle: { textFill: '#005986' } },
                },
                saveAsImage: {
                    iconStyle: { borderColor: '#005986' },
                    emphasis: { iconStyle: { textFill: '#005986' } },
                },
            },
        },
        dataZoom: [
            {
                type: 'inside',
                filterMode: 'none',
                minValueSpan: 3600 * 24 * 1000 * 3,
            },
        ],
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow',
                lineStyle: {
                    color: 'black',
                    opacity: 0.25,
                    type: 'solid',
                },
            },
            padding: 0,
            borderWidth: 0,
            formatter: (params) => {
                const param = params as CallbackDataParams;
                const previousMatch = development[param.dataIndex - 1];
                const match = development[param.dataIndex];

                if (!previousMatch) {
                    return '';
                }

                const beforeRating = ordinal(previousMatch);
                const afterRating = ordinal(match);

                const result = (
                    <div className="flex flex-col gap-2 p-2">
                        {match.date && <div className="text-center text-sm">{formatDateTime(match.date)}</div>}
                        <div className={`${chivoMonoFont.className} flex w-full grow text-4xl`}>
                            <span className="w-1/2 text-center">{match.score1}</span>
                            <span className="px-2">-</span>
                            <span className="w-1/2 text-center">{match.score2}</span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="w-10 rounded-sm bg-sky-900/50 text-center text-sm text-white">
                                {formatNumberMinMaxDigits(beforeRating, 1)}
                            </div>
                            <ArrowRightIcon></ArrowRightIcon>
                            <div
                                className={`w-10 rounded-sm text-center text-sm text-white ${beforeRating === afterRating ? 'bg-yellow-900/50' : beforeRating > afterRating ? 'bg-red-900/50' : 'bg-green-900/50'}`}
                            >
                                {formatNumberMinMaxDigits(afterRating, 1)}
                            </div>
                        </div>
                    </div>
                );

                return renderToStaticMarkup(result);
            },
        },
        xAxis: { type: 'time' },
        yAxis: { splitLine: { lineStyle: { color: 'black', opacity: 0.1 } } },
        grid: {
            top: '20px',
            left: '20px',
            right: '20px',
            bottom: '20px',
        },
        series: [
            {
                type: 'line',
                smooth: true,
                data: development.map((d) => ({
                    value: [d.date, ordinal(d)],
                    itemStyle: {
                        color: getItemColor(d.result),
                        borderColor: getItemBorderColor(d.result),
                        borderWidth: 1,
                    },
                })),
                symbolSize: 12,
                symbol: 'circle',
                markPoint: {
                    data: [
                        {
                            name: 'Max pontszám',
                            type: 'max',
                            symbolSize: 60,
                            itemStyle: { color: '#1a9c4e', borderColor: '#0f6132', borderWidth: 1 },
                            symbolRotate: 180,
                            label: { offset: [0, 15] },
                        },
                        {
                            name: 'Min pontszám',
                            type: 'min',
                            symbolSize: 60,
                            itemStyle: { color: '#d63031', borderColor: '#8b0000', borderWidth: 1 },
                            label: { offset: [0, 0] },
                        },
                    ],
                    silent: true,
                    label: { formatter: (params) => formatNumberMinMaxDigits(params.value as number, 1) },
                },
            },
        ],
    };

    return (
        <Card>
            <ReactEChartsCore echarts={echarts} opts={{ locale: 'HU' }} option={option} />
        </Card>
    );
}

function getItemColor(result?: number): string {
    if (result == null) {
        return '#005986';
    } else if (result === 1) {
        return '#1a9c4e';
    } else if (result === -1) {
        return '#d63031';
    } else {
        return '#d4a017';
    }
}

function getItemBorderColor(result?: number): string {
    if (result == null) {
        return '#005986';
    } else if (result === 1) {
        return '#0f6132';
    } else if (result === -1) {
        return '#8b0000';
    } else {
        return '#8a6200';
    }
}
