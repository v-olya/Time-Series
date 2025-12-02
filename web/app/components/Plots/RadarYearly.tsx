'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData } from '../../lib/types';
import { movePlotDown, plotMargin, plotTitle } from '../../lib/const';
import { PALETTE } from '../../lib/generatedPalette';
import { buildCustomRadarTraces } from '../../lib/plotlyUtils';

import PlotlyWrapper from './PlotlyWrapper';

export type RadarItem = { seriesKey: string; label: string; color: string };

type Props = {
  data: ProcessedData;
  items: RadarItem[];
  title: string;
  height?: number;
};

export function RadarYearly({ data, items, title, height = 520 }: Props) {
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    Object.values(data.series || {}).forEach((series) => {
      series.forEach((pt) => {
        const d = new Date(pt.date);
        if (!Number.isNaN(d.getTime())) {
          yearSet.add(d.getFullYear());
        }
      });
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [data.series]);

  const traces = useMemo(() => buildCustomRadarTraces(data.series || {}, items, years, PALETTE), [data.series, items, years]);

  const flat = traces.flatMap((t) => (t.r as number[]) || []);
  const rMin = flat.length ? Math.min(...flat) : 0;
  const rMax = flat.length ? Math.max(...flat) : 1;

  return (
    <div className="card">
      <PlotlyWrapper
        data={traces}
        layout={{
          height,
          title: { text: title, font: plotTitle },
          polar: {
            angularaxis: {
              type: 'category',
              categoryorder: 'array',
              categoryarray: years.map(String),
              direction: 'clockwise',
              rotation: 0,
            },
            radialaxis: { visible: true, range: [Math.max(0, rMin * 0.9), rMax * 1] },
          },
          showlegend: true,
          margin: movePlotDown(plotMargin),
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}