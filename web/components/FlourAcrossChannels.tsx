'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData } from '../lib/types';
import { Select } from './UI/Select';
import {
  aggregationOptions,
  intervalOptions,
  plotLegend,
  plotMargin,
  plotTitle,
  FLOUR_PRODUCT_SERIES_MAPPING,
  FLOUR_PRODUCT_LABELS,
  type FlourProductKey,
} from '../lib/const';
import { buildSeriesLineTrace } from '../lib/plotlyUtils';
import { extractSeriesByMapping, getPalette } from '../lib/helpers';
import { getFlourProductColors } from '../lib/plotlyUtils';
import { aggregateSeries, AggregationMethod, TimeInterval } from '../lib/aggregator';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };
type ProductKey = FlourProductKey;

export function FlourAcrossChannels({ data, height = 520 }: Props) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');
  const selected = Object.keys(FLOUR_PRODUCT_SERIES_MAPPING) as ProductKey[];

  const flourProductColors = useMemo<Record<ProductKey, string>>(() => getFlourProductColors(), []);
  const seriesData = useMemo(
    () => extractSeriesByMapping<ProductKey>(data.series, FLOUR_PRODUCT_SERIES_MAPPING),
    [data.series],
  );

  const traces = useMemo(() => {
    if (!seriesData) return [];
    return selected
      .map((k: ProductKey) => {
        const pts = aggregateSeries(seriesData[k], timeInterval, aggregationMethod) || [];
        const color = flourProductColors[k];
        return buildSeriesLineTrace(pts, FLOUR_PRODUCT_LABELS[k], color, 6, 2);
      })
      .filter(Boolean);
  }, [seriesData, selected, aggregationMethod, timeInterval, flourProductColors]);

  if (!seriesData) return <div className="empty-state">No flour channel series available</div>;

  const options = (Object.keys(FLOUR_PRODUCT_LABELS) as ProductKey[]).map((k) => ({ value: k, label: FLOUR_PRODUCT_LABELS[k] }));

  return (
    <div className="group">
      <div className="card plot-container">
        <div className="plot-controls">
          <Select
            id="flour-interval"
            label="Interval:"
            value={timeInterval}
            onChange={(v) => setTimeInterval(v as TimeInterval)}
            options={intervalOptions}
          />
          <Select
            id="flour-aggregation"
            label="Aggregation:"
            value={aggregationMethod}
            onChange={(v) => setAggregationMethod(v as AggregationMethod)}
            options={aggregationOptions}
          />
        </div>

        <Plot
          data={traces}
          layout={{
            height,
            title: { text: '<b>Flour Prices Across Distribution Channels</b>', font: plotTitle },
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
