'use client';

import { useMemo } from 'react';
import type * as Plotly from 'plotly.js';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint, AllDairyKeys } from '../lib/types';
import { MONTH_LABELS, plotMargin, plotTitle, productKeyToSeriesKey, ALL_DAIRY_LABELS, movePlotDown } from 'lib/const';
import { getPalette } from 'lib/helpers';
import type { Palette } from 'lib/types';
import { buildCustomRadarTraces } from 'lib/plotlyUtils';
import { DAIRY_RADAR_KEYS, DAIRY_RADAR_COLOR_KEYS } from 'lib/const';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height: number };

export function DairyRadar({ data, height }: Props) {

  // Read CSS palette on the client because of DOM access
  const PALETTE = useMemo(() => getPalette(), []);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    Object.values(data.series || {}).forEach((series: TimePoint[]) => {
      series.forEach((pt) => {
        const d = new Date(pt.date);
        if (!Number.isNaN(d.getTime())) {
          yearSet.add(d.getFullYear());
        }
      });
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [data.series]);

  const traces = useMemo(() => {
    const seriesMap = data.series || {};
    const items = DAIRY_RADAR_KEYS.map((k, i) => ({
      seriesKey: productKeyToSeriesKey(k),
      label: ALL_DAIRY_LABELS[k],
      color: PALETTE[DAIRY_RADAR_COLOR_KEYS[i] as keyof Palette],
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
          title: {
            text: '<b>Average Yearly Prices<br><br> Retail (S) and Industry (P)</b>',
            font: plotTitle,
            x: 0.5,
            y: 0.93,
            xref: 'paper',
            yref: 'container',
          },
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
