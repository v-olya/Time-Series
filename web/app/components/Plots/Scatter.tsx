'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../../lib/types';
import { Select } from '../UI/Select';
import { plotTitle, plotMargin, SEASONS_ORDER } from '../../lib/const';
import { pearson, alignSeriesByDate, getSeasonColors, bucketBySeason } from '../../lib/helpers';
import { PALETTE } from '../../lib/generatedPalette';
import { buildSeasonScatterTraces } from '../../lib/plotlyUtils';

import PlotlyWrapper from './PlotlyWrapper';

type ScatterProductOption = { value: string; label: string };

type Props = {
  data: ProcessedData;
  baseSeriesKey: string;
  productOptions: ScatterProductOption[];
  baseLabel: string;
  height?: number;
};

export function Scatter({ data, baseSeriesKey, productOptions, baseLabel, height = 480 }: Props) {
  const showPicker = productOptions.length > 2;
  const [product, setProduct] = useState<string>(productOptions[0].value);

  const seasonColors = getSeasonColors(PALETTE);

  // Get two series to compare
  const [series1, series2] = useMemo(() => {
    if (showPicker) {
      return [
        ((data.series || {})[baseSeriesKey] || []) as TimePoint[],
        ((data.series || {})[product] || []) as TimePoint[],
      ];
    } else {
      return [
        ((data.series || {})[productOptions[0].value] || []) as TimePoint[],
        ((data.series || {})[productOptions[1]?.value] || []) as TimePoint[],
      ];
    }
  }, [data.series, product, baseSeriesKey, productOptions, showPicker]);

  const points = useMemo(() => alignSeriesByDate(series1, series2), [series1, series2]);

  const corr = pearson(points.xs, points.ys);
  const corrDescriptor = Math.abs(corr) < 0.4 ? 'low' : Math.abs(corr) < 0.65 ? 'moderate' : 'high';
  const highCorr = corrDescriptor === 'high';

  const titleText = useMemo(() => {
    const labels = showPicker
      ? [baseLabel, productOptions.find((opt) => opt.value === product)?.label || product]
      : [productOptions[0].label, productOptions[1]?.label || productOptions[1]?.value];

    return `<b>${labels[0]}  VS  ${showPicker ? '                              ' : labels[1]}</b><br><br>` +
           `R = ${corr.toFixed(2)} – ${highCorr ? '<b>' : ''}${corrDescriptor}${highCorr ? '</b>' : ''} correlation`;
  }, [showPicker, productOptions, product, baseLabel, corr, corrDescriptor, highCorr]);

  const seasonPoints = useMemo(() => bucketBySeason(points.xs, points.ys, points.labels, SEASONS_ORDER), [points]);

  const traces = useMemo(() => {
    const traces = buildSeasonScatterTraces(seasonPoints, seasonColors,
      showPicker ? (productOptions.find((opt) => opt.value === product)?.label || product) : (productOptions[1]?.label || 'Second'),
      SEASONS_ORDER);

    if (!showPicker) {
      const firstLabel = productOptions[0].label;
      const secondLabel = productOptions[1]?.label || 'Second';
      return traces.map((trace) => ({
        ...trace,
        hovertemplate: `%{text}<br>${firstLabel}: %{x} CZK<br>${secondLabel}: %{y} CZK<extra></extra>`,
      }));
    }
    return traces;
  }, [showPicker, seasonPoints, product, seasonColors, productOptions]);

  const allX = traces.flatMap((t) => ((t as Plotly.ScatterData).x as number[]) || []);
  const allY = traces.flatMap((t) => ((t as Plotly.ScatterData).y as number[]) || []);
  const xMin = allX.length ? Math.min(...allX) : 0;
  const xMax = allX.length ? Math.max(...allX) : 1;
  const yMin = allY.length ? Math.min(...allY) : 0;
  const yMax = allY.length ? Math.max(...allY) : 1;
  const xPad = (xMax - xMin) * 0.08 || 0.5;
  const yPad = (yMax - yMin) * 0.08 || 1;

  if (traces.length === 0) {
    return <div className="empty-state">No data available</div>;
  }

  return (
    <div className="card pos-relative" style={{ height }}>
      {showPicker && (
        <span className="pos-absolute overlay right-corner">
          <Select
            id="product"
            label="Product:"
            value={product}
            onChange={(v) => setProduct(v)}
            options={productOptions}
          />
        </span>
      )}

      <PlotlyWrapper
        data={traces}
        layout={{
          height,
          title: { text: titleText, font: plotTitle },
          annotations: [
            {
              text: `${showPicker ? 'S = Retail; P = Industrial price' : ''}`,
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
            domain: [0, 0.9],
          },
          hovermode: 'closest' as const,
          showlegend: true,
          margin: { ...plotMargin, b: 60 },
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}