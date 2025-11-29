'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types/processed';
import type * as Plotly from 'plotly.js';
import { Select } from './UI/Select';
import { getPalette, plotTitle, plotMargin } from 'lib/const';

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

export default function MilkFunnel({ data, height = 420 }: Props) {
  const series = data.series;
  const seriesData = useMemo(() => {
    if (!series) return null;
    return Object.fromEntries(
      (['milk_p', 'milk_s', 'milk_z'] as ChannelKey[]).map((ch) => [ch, (series[SERIES_KEYS[ch]] || []) as TimePoint[]]),
    ) as Record<ChannelKey, TimePoint[]>;
  }, [series]);

  const yearSet = useMemo(() => {
    if (!seriesData) return [] as string[];
    const s = new Set<string>();
    Object.values(seriesData).forEach((arr) => {
      arr.forEach((tp) => {
        if (tp && typeof tp.date === 'string') s.add(tp.date.slice(0, 4));
      });
    });
    return Array.from(s).sort();
  }, [seriesData]);

  const [selectedYear, setSelectedYear] = useState('2025');

  if (!seriesData) return <div>No milk data available</div>;

  const CHANNEL_COLORS = channelColorsFromCss();

  // Order: Z -> P -> S
  const order: ChannelKey[] = ['milk_z', 'milk_p', 'milk_s'];
  function averageForYear(points: TimePoint[], year: string) {
    if (!points || !year) return 0;
    const vals = points
      .filter((p) => typeof p.value === 'number' && p.date?.startsWith(year))
      .map((p) => p.value) as number[];
    if (vals.length === 0) return 0;
    return vals.reduce((s, v) => s + v, 0) / vals.length;
  }
  const valuesForYear = order.map((ch) => averageForYear(seriesData[ch], selectedYear));

  // Compute percentages relative to farm-gate
  const base = valuesForYear[0] || 0;
  const relativePercents = valuesForYear.map((v) => (base > 0 ? (v / base) * 100 : 0));
  const percentText = relativePercents.map((p) => `${p.toFixed(0)}%`);
  const trace: Plotly.Data = {
    type: 'funnel' as const,
    y: order.map((ch) => CHANNEL_LABELS[ch]),
    x: valuesForYear,
    text: percentText,
    textinfo: 'text',
    textposition: 'inside',
    marker: { color: order.map((ch) => CHANNEL_COLORS[ch]) },
    customdata: relativePercents,
    hovertemplate: '%{y}: %{x:.2f} CZK (%{customdata:.0f}%)<extra></extra>',
  };

  return (
    <div className="group">
      <div className="card plot-container">
        <div className="plot-controls">
          <Select
            id="milk-funnel-year"
            label="Year"
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearSet.map((y) => ({ value: y, label: y }))}
          />
        </div>
        <Plot
          data={[trace]}
          layout={{
            height,
            title: {
              text: '<b>Milk Prices Funnel  (Farm-gate → Industry  → Retail)</b>',
              font: plotTitle,
            },
            yaxis: { title: { text: '' }, showticklabels: false, showline: false, zeroline: false },
            xaxis: { title: { text: '' }, showline: false, zeroline: false },
            margin: plotMargin,
            showlegend: false,
          }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}
