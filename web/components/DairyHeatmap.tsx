'use client';

import React, { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types/processed';
import { Select } from './UI/Select';
import { getPalette, MONTH_LABELS, plotMargin, plotTitle } from 'lib/const';
import type * as Plotly from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

const METRIC_OPTIONS = [
  { value: 'dairyIndex', label: 'Dairy Index' },
  { value: 'milk_s', label: 'Milk (S)' },
  { value: 'edam_s', label: 'Edam (S)' },
  { value: 'butter_s', label: 'Butter (S)' },
];

const SERIES_KEYS: Record<string, string> = {
  milk_s: 'S  mléko polotučné pasterované [l]_timeseries',
  edam_s: 'S  eidamská cihla [kg]_timeseries',
  butter_s: 'S  máslo [kg]_timeseries',
};

function average(arr: number[]) {
  if (!arr || arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function DairyHeatmap({ data, height = 520 }: Props) {
  const [metric, setMetric] = useState<string>('dairyIndex');

  const seriesPoints = useMemo(() => {
    if (metric === 'dairyIndex') {
      return data.timeSeries || [];
    }
    const key = SERIES_KEYS[metric];
    if (!key || !data.series) return [];
    return (data.series[key] || []) as TimePoint[];
  }, [data, metric]);

  const { years, z } = useMemo(() => {
    const map = new Map<number, Map<number, number[]>>();

    (seriesPoints || []).forEach((pt) => {
      const d = new Date(pt.date);
      if (Number.isNaN(d.getTime())) return;
      const y = d.getFullYear();
      const m = d.getMonth();
      if (!map.has(y)) map.set(y, new Map());
      const months = map.get(y)!;
      if (!months.has(m)) months.set(m, []);
      months.get(m)!.push(pt.value);
    });

    const yearsArr = Array.from(map.keys()).sort((a, b) => a - b);

    const zMatrix: (number | null)[][] = [];

    yearsArr.forEach((y) => {
      const months = map.get(y)!;
      const row: (number | null)[] = [];
      for (let m = 0; m < 12; m++) {
        const vals = months.get(m) || [];
        const v = vals.length ? average(vals) : NaN;
        row.push(Number.isNaN(v) ? null : parseFloat(v.toFixed(2)));
      }
      zMatrix.push(row);
    });

    return { years: yearsArr, z: zMatrix };
  }, [seriesPoints]);

  if (!seriesPoints || seriesPoints.length === 0) {
    return <div>No data available for selected metric</div>;
  }

  const flatValues = z.flat().filter((v) => v !== null) as number[];
  const zmin = Math.min(...flatValues);
  const zmax = Math.max(...flatValues);

  const basePlotData = {
    x: [...Array(12).keys()],
    y: years,
    colorscale: 'RdBu',
    zmin,
    zmax,
    colorbar: {
      title: { text: 'Price' },
      x: 0.97, // Move colorbar closer to the right plot
      xanchor: 'left',
    },
    hovertemplate: '%{y} %{x}: %{z}<extra></extra>',
  };

  return (
    <div className="group">
      <div className="card plot-container">
        <div className="plot-controls">
          <Select
            id="heatmap-metric"
            label="Metric:"
            value={metric}
            onChange={(v) => setMetric(v)}
            options={METRIC_OPTIONS}
          />
        </div>

        <Plot
          data={((): Plotly.Data[] => {
            // Heatmap trace (left)
            const heatmap = { z, type: 'heatmap', ...basePlotData } as Plotly.Data;

            // Surface trace (right) — convert nulls to NaN for surface
            const zForSurface = z.map((row) => row.map((v) => (v === null ? NaN : v)));
            const surface = { z: zForSurface, type: 'surface', ...basePlotData } as Plotly.Data;

            return [heatmap, surface];
          })()}
          layout={((): Partial<Plotly.Layout> => ({
            height,
            title: { text: '<b>Seasonal heat maps of retail prices and the aggregate index</b>', font: plotTitle },
            // Left heatmap domain and right surface (3D) domain
            xaxis: { domain: [0, 0.43], scaleanchor: 'y', tickmode: 'array', tickvals: [...Array(12).keys()], ticktext: MONTH_LABELS },
            yaxis: { domain: [0, 0.96], tickmode: 'array', tickvals: years, ticktext: years.map(String) },
            // Scene for the 3D surface, positioned on the right
            scene: {
              domain: { x: [0.44, 1], y: [0, 1] },
              camera: { eye: { x: -1, y: -1.0, z: 1 } },
              xaxis: { title: {text: ''}, tickmode: 'array', tickvals: [...Array(12).keys()], ticktext: MONTH_LABELS },
              yaxis: { title: {text: ''}, tickmode: 'array', tickvals: [...Array(years.length).keys()], ticktext: years.map((y) => '') },

            },
            margin: plotMargin,
          }))()}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}

export default DairyHeatmap;
