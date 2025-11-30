'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types';
import { Select } from './UI/Select';
import { DAIRY_RETAIL_KEYS, DAIRY_RETAIL_OPTIONS, MONTH_LABELS, plotMargin, plotTitle } from 'lib/const';
import { buildSeasonalMatrix } from 'lib/helpers';
import type * as Plotly from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

export function DairyHeatmap({ data, height = 520 }: Props) {
  const [metric, setMetric] = useState<string>('dairyIndex');

  const seriesPoints = useMemo(() => {
    if (metric === 'dairyIndex') {
      return data.timeSeries || [];
    }
    const key = DAIRY_RETAIL_KEYS[metric];
    if (!key || !data.series) return [];
    return (data.series[key] || []) as TimePoint[];
  }, [data, metric]);
  const hasData = seriesPoints.length > 0;

  const { years, z } = useMemo(() => buildSeasonalMatrix(seriesPoints), [seriesPoints]);

  const flatValues = useMemo(() => z.flat().filter((v): v is number => v !== null), [z]);
  const { zmin, zmax } = useMemo(() => {
    if (flatValues.length === 0) {
      return { zmin: 0, zmax: 0 };
    }
    return { zmin: Math.min(...flatValues), zmax: Math.max(...flatValues) };
  }, [flatValues]);

  const basePlotData = useMemo(
    () => ({
      x: [...Array(12).keys()],
      y: years,
      colorscale: 'RdBu' as const,
      zmin,
      zmax,
      colorbar: {
        title: { text: 'Price' },
        x: 0.97,
        xanchor: 'left' as const,
      },
      hovertemplate: '%{y} %{x}: %{z}<extra></extra>',
    }),
    [years, zmin, zmax],
  );

  const plotData = useMemo(() => {
    const heatmap = { z, type: 'heatmap', ...basePlotData } as Plotly.Data;
    const zForSurface = z.map((row) => row.map((v) => (v === null ? NaN : v)));
    const surface = { z: zForSurface, type: 'surface', ...basePlotData } as Plotly.Data;
    return [heatmap, surface];
  }, [basePlotData, z]);

  const plotLayout = useMemo<Partial<Plotly.Layout>>(
    () => ({
      height,
      title: { text: '<b>Seasonal heat maps of retail prices and the aggregate index</b>', font: plotTitle },
      xaxis: { domain: [0, 0.43], scaleanchor: 'y', tickmode: 'array', tickvals: [...Array(12).keys()], ticktext: MONTH_LABELS },
      yaxis: { domain: [0, 0.96], tickmode: 'array', tickvals: years, ticktext: years.map(String) },
      scene: {
        domain: { x: [0.44, 1], y: [0, 1] },
        camera: { eye: { x: -1, y: -1.0, z: 1 } },
        xaxis: { title: { text: '' }, tickmode: 'array', tickvals: [...Array(12).keys()], ticktext: MONTH_LABELS },
        yaxis: { title: { text: '' }, tickmode: 'array', tickvals: [...Array(years.length).keys()], ticktext: years.map(() => '') },
      },
      margin: plotMargin,
    }),
    [height, years],
  );

  return (
    <div className="group">
      <div className="card plot-container">
        <div className="plot-controls">
          <Select
            id="heatmap-metric"
            label="Metric:"
            value={metric}
            onChange={(v) => setMetric(v)}
            options={DAIRY_RETAIL_OPTIONS}
          />
        </div>

        {hasData ? (
          <Plot data={plotData} layout={plotLayout} config={{ responsive: true }} />
        ) : (
          <div className="empty-state">No data available for selected metric</div>
        )}
      </div>
    </div>
  );
}
