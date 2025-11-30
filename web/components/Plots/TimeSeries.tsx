'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData } from '../../lib/types';
import { Select } from '../UI/Select';
import { MultiSelect } from '../UI/MultiSelect';
import { aggregationOptions, intervalOptions, plotLegend, plotMargin, plotTitle } from '../../lib/const';
import { buildSeriesLineTrace } from '../../lib/plotlyUtils';
import { extractSeriesByMapping } from '../../lib/helpers';
import { aggregateSeries, AggregationMethod, TimeInterval } from '../../lib/aggregator';

import PlotlyWrapper from './PlotlyWrapper';

type ProductOption = { value: string; label: string };

type Props<T extends string> = {
  data: ProcessedData;
  height?: number;
  productKeys: T[];
  seriesMapping: Record<T, string>;
  productLabels: Record<T, string>;
  colors: Record<T, string>;
  title: string;
  yAxisTitle: string;
  enableProductSelection?: boolean;
  defaultSelectedProducts?: T[];
};

export function TimeSeries<T extends string>({
  data,
  height = 600,
  productKeys,
  seriesMapping,
  productLabels,
  colors,
  title,
  yAxisTitle,
  enableProductSelection = false,
  defaultSelectedProducts,
}: Props<T>) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('month');
  const [selectedProducts, setSelectedProducts] = useState<T[]>(
    defaultSelectedProducts || (enableProductSelection ? productKeys.slice(0, 2) : productKeys),
  );

  const seriesData = useMemo(() => extractSeriesByMapping(data.series, seriesMapping), [data.series, seriesMapping]);

  const traces = useMemo(() => {
    if (!seriesData) return [];

    const productsToShow = enableProductSelection ? selectedProducts : productKeys;
    return productsToShow.map((productKey) => {
      const points = aggregateSeries(seriesData[productKey], timeInterval, aggregationMethod) || [];
      return buildSeriesLineTrace(points, productLabels[productKey], colors[productKey], 6, 2);
    });
  }, [seriesData, selectedProducts, productKeys, enableProductSelection, aggregationMethod, timeInterval, colors, productLabels]);

  if (!seriesData) {
    return <div className="empty-state">No data available</div>;
  }

  const productOptions: ProductOption[] = productKeys.map((key) => ({
    value: key,
    label: productLabels[key],
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
          {enableProductSelection && (
            <MultiSelect
              id="products"
              label="Products:"
              value={selectedProducts}
              onChange={(value) => setSelectedProducts(value as T[])}
              options={productOptions}
            />
          )}
          <Select
            id="aggregation"
            label="Aggregation:"
            value={aggregationMethod}
            onChange={(value) => setAggregationMethod(value as AggregationMethod)}
            options={aggregationOptions}
          />
        </div>

        <PlotlyWrapper
          data={traces}
          layout={{
            height,
            title: { text: title, font: plotTitle },
            xaxis: {
              type: 'date',
              dtick: 'M12',
              tickformat: '%Y',
            },
            yaxis: { title: { text: yAxisTitle } },
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