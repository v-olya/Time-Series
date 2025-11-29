'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types/processed';
import { Select } from './Select';
import { aggregationOptions, intervalOptions, getPalette, plotLegend, plotMargin } from 'lib/const';
import aggregateSeries, { AggregationMethod, TimeInterval } from 'lib/aggregator';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

type ChannelKey = 'milk_p' | 'milk_s' | 'milk_z';

const CHANNEL_LABELS: Record<ChannelKey, string> = {
  milk_p: 'Industry (P)',
  milk_s: 'Retail (S)',
  milk_z: 'Farm-gate (Z)',
};

function channelColorsFromCss() {
  const p = getPalette();
  return {
    milk_p: p.plotlyGreen,
    milk_s: p.plotlyOrange,
    milk_z: p.plotlyBlue,
  } as Record<ChannelKey, string>;
}

const SERIES_KEYS: Record<ChannelKey, string> = {
  milk_p: 'P  mléko polotučné [l]_timeseries',
  milk_s: 'S  mléko polotučné pasterované [l]_timeseries',
  milk_z: 'Z  mléko kravské q. tř. j. [l]_timeseries',
};

export function MilkAcrossChannels({ data, height = 500 }: Props) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');

  const seriesData = useMemo(() => {
    if (!data.series) return null;

    const series = data.series;

    return Object.fromEntries(
      (['milk_p', 'milk_s', 'milk_z'] as ChannelKey[]).map((ch) => [
        ch,
        (series[SERIES_KEYS[ch]] || []) as TimePoint[],
      ]),
    ) as Record<ChannelKey, TimePoint[]>;
  }, [data.series]);

  const traces = useMemo(() => {
    if (!seriesData) return [];

    const CHANNEL_COLORS = channelColorsFromCss();

    return (['milk_z', 'milk_p', 'milk_s'] as ChannelKey[]).map((ch) => {
      const points = aggregateSeries(seriesData[ch], timeInterval, aggregationMethod) || [];
      return {
        x: points.map((p) => p.date),
        y: points.map((p) => p.value),
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        name: CHANNEL_LABELS[ch],
        line: { color: CHANNEL_COLORS[ch], width: 2 },
        marker: { size: 5, color: CHANNEL_COLORS[ch] },
      };
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
            title: { text: '<b>Plain Milk Prices Across Distribution Channels</b>', font: { family: 'Montserrat, Arial, sans-serif', size: 20 } },
            xaxis: { title: { text: 'Month' } },
            yaxis: { title: { text: 'Price (CZK)' } },
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
