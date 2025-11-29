'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { MilkChannelsKey, ProcessedData, TimePoint } from '../lib/types/types';
import { Select } from './UI/Select';
import { aggregationOptions, intervalOptions, getPalette, plotLegend, plotMargin, plotTitle, MILK_ONLY_KEYS } from 'lib/const';
import aggregateSeries, { AggregationMethod, TimeInterval } from 'lib/aggregator';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

const CHANNEL_LABELS: Record<MilkChannelsKey, string> = {
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
  } as Record<MilkChannelsKey, string>;
}

export function MilkAcrossChannels({ data, height = 500 }: Props) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');

  const seriesData = useMemo(() => {
    if (!data.series) return null;

    const series = data.series;

    return Object.fromEntries(
      (['milk_p', 'milk_s', 'milk_z'] as MilkChannelsKey[]).map((ch) => [
        ch,
        (series[MILK_ONLY_KEYS[ch]] || []) as TimePoint[],
      ]),
    ) as Record<MilkChannelsKey, TimePoint[]>;
  }, [data.series]);

  const traces = useMemo(() => {
    if (!seriesData) return [];

    const CHANNEL_COLORS = channelColorsFromCss();

    return (['milk_z', 'milk_p', 'milk_s'] as MilkChannelsKey[]).map((ch) => {
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
            title: { text: '<b>Plain Milk Prices Across Distribution Channels</b>', font: plotTitle },
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
