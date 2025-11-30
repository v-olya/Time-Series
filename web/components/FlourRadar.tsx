'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types';
import { 
  plotMargin,
  plotTitle,
  FLOUR_PRODUCT_SERIES_MAPPING, 
  FLOUR_PRODUCT_LABELS, 
  type FlourProductKey, 
  FLOUR_RADAR_KEYS, 
  FLOUR_RADAR_COLOR_KEYS } from '../lib/const';
import { getPalette } from '../lib/helpers';
import type { Palette } from '../lib/types';
import { buildCustomRadarTraces } from '../lib/plotlyUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

export function FlourRadar({ data, height = 520 }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    Object.values(data.series || {}).forEach((series: TimePoint[]) => {
      series.forEach((pt) => {
        const d = new Date(pt.date);
        if (!Number.isNaN(d.getTime())) yearSet.add(d.getFullYear());
      });
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [data.series]);
  const traces = useMemo(() => {
    const seriesMap = data.series || {};
    const items = FLOUR_RADAR_KEYS.map((k, i) => ({
      seriesKey: FLOUR_PRODUCT_SERIES_MAPPING[k],
      label: FLOUR_PRODUCT_LABELS[k],
      color: PALETTE[FLOUR_RADAR_COLOR_KEYS[i] as keyof Palette],
    }));
    return buildCustomRadarTraces(seriesMap, items, years, PALETTE);
  }, [data.series, years, PALETTE]);

  const flat = traces.flatMap((t) => (t.r as number[]) || []);
  const rMin = flat.length ? Math.min(...flat) : 0;
  const rMax = flat.length ? Math.max(...flat) : 1;

  return (
    <div className="card">
      <Plot
        data={traces}
        layout={{
          height,
          title: { text: '<b>Average Yearly Prices — Flour products</b>', font: plotTitle },
          polar: {
            angularaxis: { type: 'category', categoryorder: 'array', categoryarray: years.map(String), direction: 'clockwise' },
            radialaxis: { visible: true, range: [Math.max(0, rMin * 0.9), rMax * 1] },
          },
          showlegend: true,
          margin: plotMargin,
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}
