'use client';

import { useMemo } from 'react';
import type * as Plotly from 'plotly.js';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint, AllDairyKeys } from '../lib/types';
import { MONTH_LABELS, plotMargin, plotTitle, productKeyToSeriesKey, ALL_DAIRY_LABELS, movePlotDown } from 'lib/const';
import { averageYear, getPalette } from 'lib/helpers';

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
    const prodKeys: { key: AllDairyKeys; colorKey: keyof ReturnType<typeof getPalette> }[] = [
      { key: 'butter_s', colorKey: 'plotlyRed' },
      { key: 'edam_s', colorKey: 'plotlyBlue' },
      { key: 'butter_p', colorKey: 'plotlyGreen' },
      { key: 'edam_p', colorKey: 'plotlyYellow' },
    ];

    type RadarTrace = {
      type: 'scatterpolar';
      r: number[];
      theta: string[];
      fill: 'toself';
      name: string;
      marker?: { color: string };
    };

    return prodKeys.map((p) => {
      const seriesKey = productKeyToSeriesKey(p.key);
      const pts = seriesMap[seriesKey] as TimePoint[] | undefined;
      const r = averageYear(pts, years).map((v) => (v === null ? 0 : (v as number)));
      const trace: RadarTrace = {
        type: 'scatterpolar',
        r,
        theta: years.map(String),
        fill: 'toself',
        name: ALL_DAIRY_LABELS[p.key],
        marker: { color: PALETTE[p.colorKey] },
      };
      return trace;
    }) as RadarTrace[];
  }, [data.series, years, PALETTE]);

  const flat = traces.flatMap((t) => t.r || []);
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
