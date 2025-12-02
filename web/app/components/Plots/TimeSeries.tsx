'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { ProcessedData } from '../../lib/types';
import { Select } from '../UI/Select';
import { MultiSelect } from '../UI/MultiSelect';
import { aggregationOptions, ML_TRAINING_MESSSAGES, plotLegend, plotMargin, plotTitle } from '../../lib/const';
import { buildSeriesLineTrace, buildForecastTraces } from '../../lib/plotlyUtils';
import { extractSeriesByMapping, getPalette } from '../../lib/helpers';
import { aggregateSeries, AggregationMethod } from '../../lib/aggregator';

import PlotlyWrapper from './PlotlyWrapper';
import type * as Plotly from 'plotly.js';

type ProductOption = { value: string; label: string };

type ConfidenceLevel = '85' | '95';

const confidenceOptions: { value: ConfidenceLevel; label: string }[] = [
  { value: '85', label: '85%' },
  { value: '95', label: '95%' },
];

function getProductsToShow<T extends string>(
  allProductKeys: T[],
  selectedProducts: T[],
  enableProductSelection: boolean,
): T[] {
  return enableProductSelection ? selectedProducts : allProductKeys;
}

function useObservedDateKeys<T extends string>(
  aggregatedSeries: Map<T, { date: string; value: number }[]>,
) {
  return useMemo(() => {
    const map = new Map<T, Set<string>>();
    for (const [productKey, points] of aggregatedSeries.entries()) {
      map.set(productKey, new Set(points.map((p) => p.date)));
    }
    return map;
  }, [aggregatedSeries]);
}

function buildForecastData<T extends string>(
  productsToShow: T[],
  seriesMapping: Record<T, string>,
  forecasts: ProcessedData['forecasts'],
  forecastIntervals: ProcessedData['forecastIntervals'],
  observedDateKeys: Map<T, Set<string>>,
  aggregationMethod: AggregationMethod,
  colors: Record<T, string>,
  palette: ReturnType<typeof getPalette>,
  productLabels: Record<T, string>,
  confidenceLevel: ConfidenceLevel,
): Plotly.Data[] {
  if (!forecasts) return [];

  const all: Plotly.Data[] = [];
  for (const productKey of productsToShow) {
    const seriesKey = seriesMapping[productKey];
    const fc = forecasts?.[seriesKey];
    if (!fc || fc.length === 0) continue;

    const aggregatedFc = aggregateSeries(fc, aggregationMethod) || [];
    const observedDates = observedDateKeys.get(productKey) || new Set<string>();
    const filteredFc = aggregatedFc.filter((p) => !observedDates.has(p.date));
    if (filteredFc.length === 0) continue;

    const iv = forecastIntervals?.[seriesKey]?.[confidenceLevel];
    const traces = buildForecastTraces(
      filteredFc,
      iv,
      colors[productKey] || palette.plotlyBrown,
      productLabels[productKey],
    );
    all.push(...traces);
  }

  return all;
}

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
  
  const [mlForecasts, setMlForecasts] = useState<Record<string, { date: string; value: number }[]>>({});
  const [isTraining, setIsTraining] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState('');

  const abortRef = useRef(false);
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  const seriesData = useMemo(() => extractSeriesByMapping(data.series, seriesMapping), [data.series, seriesMapping]);

  const palette = useMemo(() => getPalette(), []);
  const forecasts = data.forecasts;
  const forecastIntervals = data.forecastIntervals;

  const productsToShow = useMemo(
    () => getProductsToShow(productKeys, selectedProducts, enableProductSelection),
    [productKeys, selectedProducts, enableProductSelection],
  );

  const aggregatedSeries = useMemo(() => {
    const map = new Map<typeof productKeys[number], { date: string; value: number }[]>();
    if (!seriesData) return map;

    for (const productKey of productsToShow) {
      const points = aggregateSeries(seriesData[productKey], aggregationMethod) || [];
      map.set(productKey, points);
    }

    return map;
  }, [seriesData, productsToShow, aggregationMethod]);

  const observedDateKeys = useObservedDateKeys(aggregatedSeries);

  const handleTrain = useCallback(async () => {
    if (!seriesData) return;
    abortRef.current = false;
    setIsTraining(true);
    const newForecasts: Record<string, { date: string; value: number }[]> = {};

    try {
      // import TensorFlow module only when the user requests training
      setTrainingStatus('Loading TensorFlow...');
      const { trainAndPredict } = await import('../../lib/inBrowserForecasts');
      
      if (abortRef.current) return;

      for (const productKey of productsToShow) {
        if (abortRef.current) return;
        setTrainingStatus(`Training ${productLabels[productKey]}...`);
        const rawSeries = seriesData[productKey];
        if (rawSeries && rawSeries.length > 0) {
          const prediction = await trainAndPredict(rawSeries, (epoch, loss) => {
            if (abortRef.current) return;
            // Update status every 5 epochs to reduce render thrashing
            if (epoch % 5 === 0) {
              setTrainingStatus(`Training ${productLabels[productKey]}... (Loss: ${loss.toFixed(4)})`);
            }
          });
          if (abortRef.current) return;
          newForecasts[productKey] = prediction;
        }
      }
      if (!abortRef.current) {
        setMlForecasts((prev) => ({ ...prev, ...newForecasts }));
      }
    } catch (e) {
      console.error('Training failed', e);
    } finally {
      if (!abortRef.current) {
        setIsTraining(false);
        setTrainingStatus('');
      }
    }
  }, [seriesData, productsToShow, productLabels]);

  const mlTraces = useMemo(() => {
    const traces: Plotly.Data[] = [];
    for (const productKey of productsToShow) {
      const fc = mlForecasts[productKey];
      if (!fc) continue;

      // Aggregate the forecast to merge into the current view
      const points = aggregateSeries(fc, aggregationMethod) || [];
      
      traces.push(
        buildSeriesLineTrace(points, `Tensorflow (${productLabels[productKey]})`, colors[productKey], 6, 3, 'dot', 'lines',
        ),
      );
    }
    return traces;
  }, [mlForecasts, productsToShow, aggregationMethod, colors, productLabels]);

  const traces = useMemo(() => {
    if (!aggregatedSeries.size) return [];

    return productsToShow.map((productKey) => {
      const points = aggregatedSeries.get(productKey) || [];
      return buildSeriesLineTrace(points, productLabels[productKey], colors[productKey], 6, 2);
    });
  }, [productsToShow, aggregatedSeries, colors, productLabels]);

  const forecastTrace = useMemo((): Plotly.Data[] | null => {
    // Show forecasts only for raw (monthly) view
    if (!showForecast || !seriesData || !forecasts || aggregationMethod !== 'raw') return null;

    const all = buildForecastData(
      productsToShow,
      seriesMapping,
      forecasts,
      forecastIntervals,
      observedDateKeys,
      aggregationMethod,
      colors,
      palette,
      productLabels,
      confidenceLevel,
    );

    return all.length ? all : null;
  }, [
    showForecast,
    seriesData,
    productsToShow,
    seriesMapping,
    colors,
    productLabels,
    forecasts,
    forecastIntervals,
    palette,
    confidenceLevel,
    aggregationMethod,
    observedDateKeys,
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
      <div className="card plot-container">
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
            onClick={handleTrain}
            disabled={isTraining}
            className="badge badge-primary badge-button"
            title={ML_TRAINING_MESSSAGES.BUTTON_TOOLTIP}
            aria-label="Train ML Model"
          >
            <>
              <img src="/neural.svg" alt="" className="train-icon" />
              {isTraining ? trainingStatus || 'Training...' : 'Train the model'}
            </>
          
          </button>
        </div>

        <PlotlyWrapper
          data={[...traces, ...(forecastTrace || []), ...mlTraces]}
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