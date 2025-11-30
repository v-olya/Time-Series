'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { MilkChannelsKey, ProcessedData } from '../lib/types';
import { Select } from './UI/Select';
import { plotTitle, plotMargin, getChannelLabelFor, MILK_ONLY_KEYS, movePlotDown } from 'lib/const';
import { getMilkChannelColors, averageForYear, buildFunnelTrace } from 'lib/plotlyUtils';
import { extractSeriesByMapping } from 'lib/helpers';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

const CHANNEL_LABELS: Record<MilkChannelsKey, string> = getChannelLabelFor('milk');
const CHANNEL_ORDER: MilkChannelsKey[] = ['milk_z', 'milk_p', 'milk_s'];
export function MilkFunnel({ data, height = 420 }: Props) {
  // Read on the client because of DOM access
  const MILK_CHANNEL_COLORS = useMemo(() => getMilkChannelColors('funnel'), []);
  const seriesData = useMemo(() => extractSeriesByMapping(data.series, MILK_ONLY_KEYS), [data.series]);

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

  const trace = useMemo(() => {
    if (!seriesData || yearSet.length === 0) return null;

    const valuesForYear = CHANNEL_ORDER.map((ch) => averageForYear(seriesData[ch], selectedYear));
    const base = valuesForYear[0] || 0;
    const relativePercents = valuesForYear.map((v) => (base > 0 ? (v / base) * 100 : 0));
    const percentText = relativePercents.map((p) => `${p.toFixed(0)}%`);

    return buildFunnelTrace(
      CHANNEL_ORDER.map((ch) => CHANNEL_LABELS[ch]),
      valuesForYear,
      percentText,
      CHANNEL_ORDER.map((ch) => MILK_CHANNEL_COLORS[ch]),
      relativePercents,
    );
  }, [seriesData, yearSet.length, selectedYear, MILK_CHANNEL_COLORS]);

  const showEmptyState = !seriesData || yearSet.length === 0;

  return (
    <div className="card">
      <div className="plot-controls">
        <Select
          id="milk-funnel-year"
          label="Year"
          value={selectedYear}
          onChange={setSelectedYear}
          options={yearSet.map((y) => ({ value: y, label: y }))}
        />
      </div>
      {showEmptyState || !trace ? (
            <div className="empty-state">No milk data available</div>
          ) : (
        <Plot
          data={[trace]}
          layout={{
            height,
            title: {
              text: '<b>Milk Prices Funnel:<br> Farm-gate → Industry  → Retail</b>',
              font: plotTitle,
            },
            yaxis: { title: { text: '' }, showticklabels: false, showline: false, zeroline: false },
            xaxis: { title: { text: '' }, showline: false, zeroline: false },
            margin: movePlotDown(plotMargin), // to align with the neighbor plot
            showlegend: false,
          }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}

