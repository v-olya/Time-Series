'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { MilkChannelsKey, ProcessedData, TimePoint } from '../lib/types';
import { Select } from './UI/Select';
import { aggregationOptions, intervalOptions, plotLegend, plotMargin, plotTitle, MILK_ONLY_KEYS } from 'lib/const';
import { getMilkChannelColors, buildSeriesLineTrace } from 'lib/plotlyUtils';
import { extractSeriesByMapping } from 'lib/helpers';
import { aggregateSeries, AggregationMethod, TimeInterval } from 'lib/aggregator';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

const CHANNEL_LABELS: Record<MilkChannelsKey, string> = {
  milk_p: 'Industry (P)',
  milk_s: 'Retail (S)',
  milk_z: 'Farm-gate (Z)',
};


export function MilkAcrossChannels({ data, height = 500 }: Props) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');

  const seriesData = useMemo(() => extractSeriesByMapping(data.series, MILK_ONLY_KEYS), [data.series]);

  const traces = useMemo(() => {
    if (!seriesData) return [];

    const CHANNEL_COLORS = getMilkChannelColors();

    return (['milk_z', 'milk_p', 'milk_s'] as MilkChannelsKey[]).map((ch) => {
      const points = aggregateSeries(seriesData[ch], timeInterval, aggregationMethod) || [];
      return buildSeriesLineTrace(points, CHANNEL_LABELS[ch], CHANNEL_COLORS[ch], 5, 2);
    });
  }, [seriesData, aggregationMethod, timeInterval]);

  if (!seriesData) return <div>No milk data available</div>;
  
  return (
    <div className="group">
      <div className="card plot-container">
        <div className="plot-controls">
          <Select
            id="milk-interval"
            label="Interval:"
            value={timeInterval}
            onChange={(v) => setTimeInterval(v as TimeInterval)}
            options={intervalOptions}
          />
          <Select
            id="milk-aggregation"
            label="Aggregation:"
            value={aggregationMethod}
            onChange={(v) => setAggregationMethod(v as AggregationMethod)}
            options={aggregationOptions}
          />
        </div>
        <Plot
          data={traces}
          layout={{
            height,
            title: { text: '<b>Milk Prices Across Distribution Channels</b>', font: plotTitle },
            yaxis: { title: { text: 'Price per kg (CZK)' } },
            hovermode: 'x unified' as const,
            showlegend: true,
            legend: plotLegend,
            margin: plotMargin,
          }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}
