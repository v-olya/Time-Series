'use client';

import { useMemo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../../lib/types';
import { Select } from '../UI/Select';
import { plotTitle, plotMargin, movePlotDown } from '../../lib/const';
import { averageForYear, buildFunnelTrace } from '../../lib/plotlyUtils';
import { extractSeriesByMapping, getYearSetFromSeriesData } from '../../lib/helpers';

import PlotlyWrapper from './PlotlyWrapper';

type FunnelProps = {
  data: ProcessedData;
  mapping: Record<string, string>;
  channelOrder: string[]; // order: farm-gate (Z), industry (P), retail (S)
  labels: Record<string, string>;
  colors: Record<string, string>;
  titleHTML?: string;
  height?: number;
};

export function Funnel({ data, mapping, channelOrder, labels, colors, titleHTML, height = 420 }: FunnelProps) {
  const seriesData = useMemo(() => extractSeriesByMapping(data.series, mapping), [data.series, mapping]);

  const yearSet = useMemo(() => getYearSetFromSeriesData(seriesData), [seriesData]);

  const [selectedYear, setSelectedYear] = useState<string>('');

  // initialize selectedYear to latest available
  useEffect(() => {
    if (yearSet.length === 0) return;
    setSelectedYear((prev) => (prev ? prev : yearSet[yearSet.length - 1]));
  }, [yearSet]);

  const colorsMap = colors;

  const trace = useMemo(() => {
    if (!seriesData || yearSet.length === 0 || !selectedYear) return null;
    const valuesForYear: number[] = channelOrder.map((ch) => averageForYear((seriesData as Record<string, TimePoint[]>)[ch], selectedYear) || 0);
    const base = valuesForYear[0] || 0;
    const relativePercents = valuesForYear.map((v) => (base > 0 ? (v / base) * 100 : 0));
    const percentText = relativePercents.map((p) => `${p.toFixed(0)}%`);

    return buildFunnelTrace(
      channelOrder.map((ch) => labels[ch] || String(ch)),
      valuesForYear,
      percentText,
      channelOrder.map((ch) => colorsMap[ch] || '#888'),
      relativePercents,
    );
  }, [seriesData, yearSet.length, selectedYear, colorsMap, channelOrder, labels]);

  const showEmptyState = !seriesData || yearSet.length === 0;

  return (
    <div className="card" style={{ height }}>
      <div className="plot-controls">
        <Select
          id="funnel-year"
          label="Year"
          value={selectedYear}
          onChange={setSelectedYear}
          options={yearSet.map((y) => ({ value: y, label: y }))}
        />
      </div>
      {showEmptyState || !trace ? (
        <div className="empty-state">No data available</div>
      ) : (
        <PlotlyWrapper
          data={[trace]}
          layout={{
            height,
            title: { text: titleHTML || '<b>Prices Funnel</b>', font: plotTitle },
            yaxis: { title: { text: '' }, showticklabels: false, showline: false, zeroline: false },
            xaxis: { title: { text: '' }, showline: false, zeroline: false },
            margin: movePlotDown(plotMargin),
            showlegend: false,
          }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}
