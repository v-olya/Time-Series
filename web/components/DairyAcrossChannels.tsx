'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types/processed';
import { Select } from './Select';
import { MultiSelect } from './MultiSelect';
import { aggregationOptions, intervalOptions, getPalette, plotLegend, plotMargin } from 'lib/const';
import aggregateSeries, { AggregationMethod, TimeInterval } from 'lib/aggregator';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

type ProductKey = 'edam_p' | 'edam_s' | 'butter_p' | 'butter_s';

const PRODUCT_LABELS: Record<ProductKey, string> = {
  edam_p: 'Edam (P)',
  edam_s: 'Edam (S)',
  butter_p: 'Butter (P)',
  butter_s: 'Butter (S)',
};

function productColorsFromCss() {
  const p = getPalette();
  return {
    butter_p: p.plotlyGreen,
    butter_s: p.plotlyRed,
    edam_p: p.plotlyBrown,
    edam_s: p.plotlyBlue,
  } as Record<ProductKey, string>;
}

export function DairyAcrossChannels({ data, height = 600 }: Props) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');
  const [selectedProducts, setSelectedProducts] = useState<ProductKey[]>(['butter_p', 'butter_s']);

  const seriesData = useMemo(() => {
    if (!data.series) return null;
    const series = data.series;

    const mapping: [ProductKey, string][] = [
      ['edam_p', 'P  eidamská cihla [kg]_timeseries'],
      ['edam_s', 'S  eidamská cihla [kg]_timeseries'],
      ['butter_p', 'P  máslo [kg]_timeseries'],
      ['butter_s', 'S  máslo [kg]_timeseries'],
    ];

    return Object.fromEntries(
      mapping.map(([key, seriesKey]) => [key, (series[seriesKey] || []) as TimePoint[]]),
    ) as Record<ProductKey, TimePoint[]>;
  }, [data.series]);

  const traces = useMemo(() => {
    if (!seriesData) return [];

    const PRODUCT_COLORS = productColorsFromCss();

    return selectedProducts.map((productKey) => {
      const points = aggregateSeries(seriesData[productKey], timeInterval, aggregationMethod) || [];
      return {
        x: points.map((p) => p.date),
        y: points.map((p) => p.value),
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        name: PRODUCT_LABELS[productKey],
        line: { color: PRODUCT_COLORS[productKey], width: 2 },
        marker: { size: 6, color: PRODUCT_COLORS[productKey] },
      };
    });
  }, [seriesData, selectedProducts, aggregationMethod, timeInterval]);

  if (!seriesData) {
    return <div>No data available</div>;
  }



  const productOptions = (Object.keys(PRODUCT_LABELS) as ProductKey[]).map((key) => ({
    value: key,
    label: PRODUCT_LABELS[key],
  }));

  return (
    <div className="group">
      <div className="card plot-container">
        <div className="plot-controls">
          <Select
            id="interval"
            label="Interval:"
            value={timeInterval}
            onChange={(value) => setTimeInterval(value as TimeInterval)}
            options={intervalOptions}
          />
          <MultiSelect
            id="products"
            label="Products:"
            value={selectedProducts}
            onChange={(value) => setSelectedProducts(value as ProductKey[])}
            options={productOptions}
          />
          <Select
            id="aggregation"
            label="Aggregation:"
            value={aggregationMethod}
            onChange={(value) => setAggregationMethod(value as AggregationMethod)}
            options={aggregationOptions}
          />
        </div>

        <Plot
          data={traces}
          layout={{
            height,
            title: { 
              text: '<b>Dairy Products Prices Across Distribution Channels</b>', 
              font: { family: 'Montserrat, Arial, sans-serif', size: 22 }, 
            },
            xaxis: { title: { text: 'Month' } },
            yaxis: { title: { text: 'Price (CZK)' } },
            hovermode: 'x unified' as const,
            showlegend: true,
            legend: plotLegend,
            margin: plotMargin,
          }}
          config={{ responsive: true }}
        />
      </div>
    </div>
  );
}
