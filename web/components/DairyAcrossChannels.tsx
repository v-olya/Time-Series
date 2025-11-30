'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types';
import { Select } from './UI/Select';
import { MultiSelect } from './UI/MultiSelect';
import { aggregationOptions, intervalOptions, plotLegend, plotMargin, plotTitle } from 'lib/const';
import { getDairyProductColors, buildSeriesLineTrace } from 'lib/plotlyUtils';
import { extractSeriesByMapping } from 'lib/helpers';
import { aggregateSeries, AggregationMethod, TimeInterval } from 'lib/aggregator';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

type ProductKey = 'edam_p' | 'edam_s' | 'butter_p' | 'butter_s';

const PRODUCT_LABELS: Record<ProductKey, string> = {
  edam_p: 'Edam (P)',
  edam_s: 'Edam (S)',
  butter_p: 'Butter (P)',
  butter_s: 'Butter (S)',
};

const PRODUCT_SERIES_MAPPING: Record<ProductKey, string> = {
  edam_p: 'P  eidamská cihla [kg]_timeseries',
  edam_s: 'S  eidamská cihla [kg]_timeseries',
  butter_p: 'P  máslo [kg]_timeseries',
  butter_s: 'S  máslo [kg]_timeseries',
};


export function DairyAcrossChannels({ data, height = 600 }: Props) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');
  const [selectedProducts, setSelectedProducts] = useState<ProductKey[]>(['butter_p', 'butter_s']);

  const seriesData = useMemo(() => extractSeriesByMapping(data.series, PRODUCT_SERIES_MAPPING), [data.series]);

  const traces = useMemo(() => {
    if (!seriesData) return [];

    const PRODUCT_COLORS = getDairyProductColors();

    return selectedProducts.map((productKey) => {
      const points = aggregateSeries(seriesData[productKey], timeInterval, aggregationMethod) || [];
      return buildSeriesLineTrace(points, PRODUCT_LABELS[productKey], PRODUCT_COLORS[productKey], 6, 2);
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
              font: plotTitle, 
            },
            yaxis: { title: { text: 'Price per kg (CZK)' } },
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
