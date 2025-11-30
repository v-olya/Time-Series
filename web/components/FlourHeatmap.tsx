'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types';
import { Select } from './UI/Select';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, plotMargin, plotTitle, MONTH_LABELS, type FlourProductKey } from 'lib/const';
import type * as Plotly from 'plotly.js';
import { buildSeasonalMatrix } from 'lib/helpers';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

export function FlourHeatmap({ data, height = 520 }: Props) {
  const [metric, setMetric] = useState<string>('flourIndex');

  const seriesPoints = useMemo<TimePoint[]>(() => {
    if (metric === 'flourIndex') return data.timeSeries || [];
    const key = (FLOUR_PRODUCT_SERIES_MAPPING as Record<string, string>)[metric];
    if (!key || !data.series) return [];
    return (data.series[key] || []) as TimePoint[];
  }, [data, metric]);

  const { years, z } = useMemo(() => buildSeasonalMatrix(seriesPoints), [seriesPoints]);

  const flatValues = useMemo(() => z.flat().filter((v): v is number => v !== null), [z]);
  const { zmin, zmax } = useMemo(() => {
    if (flatValues.length === 0) return { zmin: 0, zmax: 0 };
    return { zmin: Math.min(...flatValues), zmax: Math.max(...flatValues) };
  }, [flatValues]);

  const basePlotData = useMemo(
    () => ({
      x: [...Array(12).keys()],
      y: years,
      colorscale: 'RdBu' as const,
      zmin,
      zmax,
      colorbar: { title: { text: 'Price' }, x: 0.97, xanchor: 'left' as const },
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
      title: { text: '<b>Seasonal heat maps of flour prices and the aggregate index</b>', font: plotTitle },
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

  const productOptions = useMemo(() => {
    const keys = Object.keys(FLOUR_PRODUCT_SERIES_MAPPING) as FlourProductKey[];
    return [{ value: 'flourIndex', label: 'Flour index' }, ...keys.map((k) => ({ value: k, label: FLOUR_PRODUCT_LABELS[k] || String(k) }))];
  }, []);

  return (
    <div className="group">
      <div className="card plot-container">
        <div className="plot-controls">
          <Select id="heatmap-metric" label="Metric:" value={metric} onChange={(v) => setMetric(v)} options={productOptions} />
        </div>

        {z.flat().filter((v) => v !== null).length ? (
          <Plot data={plotData} layout={plotLayout} config={{ responsive: true }} />
        ) : (
          <div className="empty-state">No data available for selected metric</div>
        )}
      </div>
    </div>
  );
}
