'use client';

import { useState, useMemo } from 'react';
import type { ProcessedData } from '../../lib/types';
import { Select } from '../UI/Select';
import { MultiSelect } from '../UI/MultiSelect';
import { aggregationOptions, ML_TRAINING_MESSSAGES, plotLegend, plotMargin, plotTitle } from '../../lib/const';
import { buildSeriesLineTrace, buildForecastTraces } from '../../lib/plotlyUtils';
import { extractSeriesByMapping } from '../../lib/helpers';
import { aggregateSeries, AggregationMethod } from '../../lib/aggregator';
import { useMLForecasts } from '../../lib/hooks/useMLForecasts';
import { PALETTE } from '../../lib/generatedPalette';

import PlotlyWrapper from './PlotlyWrapper';
import type * as Plotly from 'plotly.js';

type ProductOption = { value: string; label: string };

type ConfidenceLevel = '85' | '95';

const confidenceOptions: { value: ConfidenceLevel; label: string }[] = [
  { value: '85', label: '85%' },
  { value: '95', label: '95%' },
];

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
  showForecast?: boolean;
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
  showForecast = true,
  defaultSelectedProducts,
}: Props<T>) {
  const [aggregationMethod, setAggregationMethod] = useState<AggregationMethod>('raw');
  const [selectedProducts, setSelectedProducts] = useState<T[]>(
    defaultSelectedProducts || (enableProductSelection ? productKeys.slice(0, 2) : productKeys),
  );
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>('85');

  const seriesData = useMemo(() => extractSeriesByMapping(data.series, seriesMapping), [data.series, seriesMapping]);

  const productsToShow = useMemo(
    () => (enableProductSelection ? selectedProducts : productKeys),
    [productKeys, selectedProducts, enableProductSelection],
  );

  const { mlForecasts, isTraining, trainingStatus, startTraining, clearForecasts, hasMlForecasts } = useMLForecasts(
    seriesData,
    productsToShow,
    productLabels,
  );

  const aggregatedSeries = useMemo(() => {
    const map = new Map<T, { date: string; value: number }[]>();
    if (!seriesData) return map;

    for (const productKey of productsToShow) {
      const points = aggregateSeries(seriesData[productKey], aggregationMethod) || [];
      map.set(productKey, points);
    }
    return map;
  }, [seriesData, productsToShow, aggregationMethod]);

  // Calculate observed dates to filter forecasts that overlap with actual data
  const observedDateKeys = useMemo(() => {
    const map = new Map<T, Set<string>>();
    for (const [productKey, points] of aggregatedSeries.entries()) {
      map.set(productKey, new Set(points.map((p) => p.date)));
    }
    return map;
  }, [aggregatedSeries]);

  const traces = useMemo(() => {
    const allTraces: Plotly.Data[] = [];

    // 1. Historical Data Traces
    for (const productKey of productsToShow) {
      const points = aggregatedSeries.get(productKey) || [];
      if (points.length > 0) {
        allTraces.push(buildSeriesLineTrace(points, productLabels[productKey], colors[productKey], 6, 2));
      }
    }

    // 2. Forecast Traces (only for raw aggregation)
    if (showForecast && seriesData && data.forecasts && aggregationMethod === 'raw') {
      for (const productKey of productsToShow) {
        const seriesKey = seriesMapping[productKey];
        const fc = data.forecasts[seriesKey];
        if (!fc || fc.length === 0) continue;

        // Filter out forecast points that overlap with observed data
        const observedDates = observedDateKeys.get(productKey);
        const filteredFc = fc.filter((p) => !observedDates?.has(p.date));
        
        if (filteredFc.length === 0) continue;

        const iv = data.forecastIntervals?.[seriesKey]?.[confidenceLevel];
        const fcTraces = buildForecastTraces(
          filteredFc,
          iv,
          colors[productKey] || PALETTE.plotlyBrown,
          productLabels[productKey],
        );
        allTraces.push(...fcTraces);
      }
    }

    // 3. ML Forecast Traces
    for (const productKey of productsToShow) {
      const fc = mlForecasts[productKey];
      if (!fc) continue;

      const points = aggregateSeries(fc, aggregationMethod) || [];
      const t = buildSeriesLineTrace(points, `Tensorflow: ${productLabels[productKey]}`, colors[productKey], 6, 3, 'dot', 'lines');
      (t as Plotly.Data & { showlegend: boolean }).showlegend = false;
      allTraces.push(t);
    }

    return allTraces;
  }, [
    productsToShow,
    aggregatedSeries,
    colors,
    productLabels,
    showForecast,
    seriesData,
    data.forecasts,
    data.forecastIntervals,
    aggregationMethod,
    seriesMapping,
    observedDateKeys,
    confidenceLevel,
    mlForecasts,
  ]);

  if (!seriesData) {
    return <div className="empty-state">No data available</div>;
  }

  const productOptions: ProductOption[] = productKeys.map((key) => ({
    value: key,
    label: productLabels[key],
  }));

  return (
    <div className="group">
      <div className="card plot-wrapper">
        <div className="plot-controls">
          <Select
            id="confidence"
            label="Confidence:"
            value={confidenceLevel}
            onChange={(value) => setConfidenceLevel(value as ConfidenceLevel)}
            disabled={aggregationMethod !== 'raw'}
            options={confidenceOptions}
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
          <button
            onClick={hasMlForecasts ? clearForecasts : startTraining}
            disabled={isTraining}
            className={`badge ${hasMlForecasts ? 'badge-secondary' : 'badge-primary'} badge-button`}
            title={hasMlForecasts ? 'Remove generated forecasts from the plot' : ML_TRAINING_MESSSAGES.BUTTON_TOOLTIP}
            aria-label={hasMlForecasts ? 'Remove forecasts' : 'Train ML Model'}
          >
            <>
              <img src="/neural.svg" alt="" className="train-icon" />
              {isTraining ? trainingStatus || 'Training...' : hasMlForecasts ? 'Remove the forecasts' : 'Train the model'}
            </>
          </button>
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
              spikemode: 'across',
            },
            yaxis: { title: { text: yAxisTitle } },
            hovermode: 'x' as const,
            hoverdistance: 1,
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