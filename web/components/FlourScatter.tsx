'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types';
import { Select } from './UI/Select';
import { plotTitle, plotMargin, SEASONS_ORDER, FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, type FlourProductKey } from '../lib/const';
import { pearson, alignSeriesByDate, getSeasonColors, bucketBySeason } from '../lib/helpers';
import { buildSeasonScatterTraces } from '../lib/plotlyUtils';
import type * as Plotly from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

const productOptions = (
  Object.keys(FLOUR_PRODUCT_SERIES_MAPPING) as FlourProductKey[]
).map((k) => ({ value: k, label: FLOUR_PRODUCT_LABELS[k] || k }));

export function FlourScatter({ data, height = 480 }: Props) {
  const [product, setProduct] = useState<FlourProductKey>(Object.keys(FLOUR_PRODUCT_SERIES_MAPPING)[0] as FlourProductKey);

  const seasonColors = useMemo(() => getSeasonColors(), []);

  const points = useMemo(() => {
    const zKey = (FLOUR_PRODUCT_SERIES_MAPPING as Record<string, string>)['wheat_z'];
    const otherKey = (FLOUR_PRODUCT_SERIES_MAPPING as Record<string, string>)[product];
    const zSeries = ((data.series || {})[zKey] || []) as TimePoint[];
    const otherSeries = ((data.series || {})[otherKey] || []) as TimePoint[];
    return alignSeriesByDate(zSeries, otherSeries);
  }, [data.series, product]);

  const corr = pearson(points.xs, points.ys);
  const corrDescriptor = Math.abs(corr) < 0.4 ? 'low' : Math.abs(corr) < 0.65 ? 'moderate' : 'high';
  const highCorr = corrDescriptor === 'high';

  const  titleText =
    '<b>Wheat  VS</b>        <br><br>' +
    `R = ${corr.toFixed(2)} – ${highCorr ? '<b>' : ''}${corrDescriptor}${highCorr ? '</b>' : ''} correlation`;

  type SeasonName = typeof SEASONS_ORDER[number];
  type SeasonBuckets = Record<SeasonName, { x: number[]; y: number[]; text: string[] }>;

  const seasonPoints = useMemo(() => bucketBySeason(points.xs, points.ys, points.labels, SEASONS_ORDER), [points]);

  const traces = useMemo(
    () =>
      buildSeasonScatterTraces(
        seasonPoints,
        seasonColors,
        FLOUR_PRODUCT_LABELS[product] || product,
        SEASONS_ORDER,
      ),
    [seasonPoints, product, seasonColors],
  ) as Plotly.ScatterData[];

  const allX = traces.flatMap((t) => (t.x as number[]) || []);
  const allY = traces.flatMap((t) => (t.y as number[]) || []);
  const xMin = allX.length ? Math.min(...allX) : 0;
  const xMax = allX.length ? Math.max(...allX) : 1;
  const yMin = allY.length ? Math.min(...allY) : 0;
  const yMax = allY.length ? Math.max(...allY) : 1;
  const xPad = (xMax - xMin) * 0.08 || 0.5;
  const yPad = (yMax - yMin) * 0.08 || 1;

  return (
    <div className="card pos-relative">
      <span className="pos-absolute overlay right-corner">
        <Select id="flour-product" label="Product:" value={product} onChange={(v) => setProduct(v as FlourProductKey)} options={productOptions} />
      </span>

      <Plot
        data={traces}
        layout={{
          height,
          title: { text: titleText, font: plotTitle },
          xaxis: { range: [xMin - xPad, xMax + xPad], tickformat: '.2f', ticksuffix: ' CZK' },
          yaxis: { range: [Math.max(0, yMin - yPad), yMax + yPad], tickformat: '.2f', ticksuffix: ' CZK' },
          hovermode: 'closest' as const,
          showlegend: true,
          margin: plotMargin,
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}
