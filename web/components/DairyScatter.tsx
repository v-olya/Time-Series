'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { AllDairyKeys, ProcessedData, TimePoint } from '../lib/types';
import { Select } from './UI/Select';
import { plotTitle, plotMargin, productKeyToSeriesKey, ALL_DAIRY_LABELS, SEASONS_ORDER } from '../lib/const';
import { monthToSeason, pearson, alignSeriesByDate, getSeasonColors } from 'lib/helpers';
import { buildSeasonScatterTraces } from 'lib/plotlyUtils';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height: number };

const productOptions = (Object.keys(ALL_DAIRY_LABELS) as AllDairyKeys[])
  .filter((k) => k !== 'milk_z')
  .map((k) => ({ value: k, label: ALL_DAIRY_LABELS[k] }));

export function DairyScatter({ data, height }: Props) {
  const [product, setProduct] = useState<AllDairyKeys>('butter_s'); // default Butter (S)

  const seasonColors = useMemo(() => getSeasonColors(), []);

  const points = useMemo(() => {
    const zKey = productKeyToSeriesKey('milk_z');
    const otherKey = productKeyToSeriesKey(product);
    const zSeries = ((data.series || {})[zKey] || []) as TimePoint[];
    const otherSeries = ((data.series || {})[otherKey] || []) as TimePoint[];
    return alignSeriesByDate(zSeries, otherSeries);
  }, [data.series, product]);

  const corr = pearson(points.xs, points.ys);
  const corrDescriptor = Math.abs(corr) < 0.4 ? 'low' : Math.abs(corr) < 0.65 ? 'moderate' : 'high';
  const highCorr = corrDescriptor === 'high';

  const titleText =
    '<b>Farm-gate Milk  VS</b>                              <br><br>' +
    `R = ${corr.toFixed(2)} \\u2014 ${highCorr ? '<b>' : ''}${corrDescriptor}${highCorr ? '</b>' : ''} correlation`;

  const seasonPoints = useMemo(() => {
    const buckets: Record<string, { x: number[]; y: number[]; text: string[] }> = {};
    SEASONS_ORDER.forEach((s) => (buckets[s] = { x: [], y: [], text: [] }));
    points.labels.forEach((dateStr, i) => {
      const d = new Date(dateStr);
      const season = monthToSeason(d.getMonth());
      buckets[season].x.push(points.xs[i]);
      buckets[season].y.push(points.ys[i]);
      buckets[season].text.push(dateStr);
    });
    return buckets;
  }, [points]);
  

  type SeasonTrace = {
    x: number[];
    y: number[];
    mode: 'markers';
    type: 'scatter';
    name: string;
    marker: { size: number; color: string; opacity: number };
    text: string[];
    hovertemplate: string;
  };
  type SeasonName = typeof SEASONS_ORDER[number];

  const traces: SeasonTrace[] = useMemo(
    () =>
      buildSeasonScatterTraces(
        seasonPoints as Record<string, { x: number[]; y: number[]; text: string[] }>,
        seasonColors,
        ALL_DAIRY_LABELS[product],
        SEASONS_ORDER,
      ) as SeasonTrace[],
    [seasonPoints, product, seasonColors],
  );

  const allX = traces.flatMap((t) => t.x || []);
  const allY = traces.flatMap((t) => t.y || []);
  const xMin = allX.length ? Math.min(...allX) : 0;
  const xMax = allX.length ? Math.max(...allX) : 1;
  const yMin = allY.length ? Math.min(...allY) : 0;
  const yMax = allY.length ? Math.max(...allY) : 1;
  const xPad = (xMax - xMin) * 0.08 || 0.5;
  const yPad = (yMax - yMin) * 0.08 || 1;

  return (
    <div className="card pos-relative">
      <span 
        className="pos-absolute overlay" 
        style={{top: '2rem', right: '25%'}}
      >
        <Select
          id="product"
          label="Product:"
          value={product}
          onChange={(v) => setProduct(v as AllDairyKeys)}
          options={productOptions}
        />
      </span>

      <Plot
        data={traces}
        layout={{
          height,
          title: { text: titleText, font: plotTitle },
          annotations: [
            {
              // place annotation inside the plot (top-left) to avoid clipping
              text: 'S = Retail; P = Industrial price',
              showarrow: false,
              xref: 'paper',
              yref: 'paper',
              x: 0.06,
              y: 0.91,
              xanchor: 'left',
              yanchor: 'top',
              align: 'left',
              bgcolor: 'rgba(255,255,255,0.85)',
              bordercolor: '#ccc',
              borderwidth: 1,
              font: { size: 12 },
            },
          ],
          xaxis: {
            range: [xMin - xPad, xMax + xPad],
            tickformat: '.2f',
            ticksuffix: ' CZK',
          },
          yaxis: {
            range: [Math.max(0, yMin - yPad), yMax + yPad],
            tickformat: '.2f',
            ticksuffix: ' CZK',
          },
          hovermode: 'closest' as const,
          showlegend: true,
          margin: plotMargin,
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}
