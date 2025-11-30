'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../lib/types';
import { Select } from './UI/Select';
import { DAIRY_RETAIL_KEYS, DAIRY_RETAIL_OPTIONS, movePlotDown, plotMargin, plotTitle } from 'lib/const';
import { getWaterfallColors, averageForYear, buildWaterfallTrace, WaterfallCustomDatum } from 'lib/plotlyUtils';
import { extractSeriesByMapping, getYearSetFromSeriesData } from 'lib/helpers';
import type * as Plotly from 'plotly.js';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = { data: ProcessedData; height?: number };

const PRODUCT_KEYS = ['dairyIndex', 'edam_s', 'butter_s', 'milk_s'] as const;
const productColors = getWaterfallColors();

export function DairyWaterfall({ data, height = 420 }: Props) {
  const series = data.series;
  const seriesData = useMemo(() => {
    const extracted = extractSeriesByMapping(series, DAIRY_RETAIL_KEYS) || {};
    return { dairyIndex: (data.timeSeries || ([] as TimePoint[])), ...extracted } as Record<string, TimePoint[]>;
  }, [data.timeSeries, series]);

  const yearSet = useMemo(() => getYearSetFromSeriesData(seriesData), [seriesData]);

  const [selectedProduct, setSelectedProduct] = useState<string>('dairyIndex');

  const { deltas, prevTotal, selTotal, keysUsed, yearLabels } = useMemo(() => {
    if (!yearSet || yearSet.length < 2) {
      return {
        deltas: [] as number[],
        prevTotal: 0,
        selTotal: 0,
        keysUsed: PRODUCT_KEYS.slice() as (typeof PRODUCT_KEYS)[number][],
        yearLabels: [] as string[],
      };
    }

    const keysToUse = [selectedProduct] as (typeof PRODUCT_KEYS)[number][];
    const deltasArr: number[] = [];
    let prevSum = 0;
    let selSum = 0;
    const labels: string[] = [];

    for (let i = 1; i < yearSet.length; i++) {
      const prevYear = yearSet[i - 1];
      const curYear = yearSet[i];
      labels.push(curYear);

      let prevYearSum = 0;
      let curYearSum = 0;
      keysToUse.forEach((k) => {
        const pts = seriesData[k] || [];
        const prev = averageForYear(pts, prevYear);
        const sel = averageForYear(pts, curYear);
        prevYearSum += Number.isNaN(prev) ? 0 : prev;
        curYearSum += Number.isNaN(sel) ? 0 : sel;
      });

      prevSum += prevYearSum;
      selSum += curYearSum;
      deltasArr.push(curYearSum - prevYearSum);
    }

    return { deltas: deltasArr, prevTotal: prevSum, selTotal: selSum, keysUsed: keysToUse, yearLabels: labels };
  }, [seriesData, yearSet, selectedProduct]);

  const { trace, topYearAnnotations } = useMemo(() => {
    if (yearLabels.length === 0) {
      return { trace: buildWaterfallTrace([], [], [], [] as WaterfallCustomDatum[], productColors), topYearAnnotations: [] };
    }

    const sumDeltas = deltas.reduce((s, v) => s + v, 0);
    const yValues = [...deltas, sumDeltas];
    const measure = [...deltas.map(() => 'relative'), 'total'];

    const customdata: WaterfallCustomDatum[] = yearLabels.map((curYear, idx) => {
      const prevYear = yearSet[idx];
      let prevYearSum = 0;
      let curYearSum = 0;
      keysUsed.forEach((k) => {
        const pts = seriesData[k] || [];
        const prev = averageForYear(pts, prevYear);
        const sel = averageForYear(pts, curYear);
        prevYearSum += Number.isNaN(prev) ? 0 : prev;
        curYearSum += Number.isNaN(sel) ? 0 : sel;
      });
      return {
        prev: Number.isNaN(prevYearSum) ? null : prevYearSum,
        sel: Number.isNaN(curYearSum) ? null : curYearSum,
        delta: deltas[idx],
      };
    });

    customdata.push({ prev: prevTotal, sel: selTotal, delta: sumDeltas });

    const annotations: Array<Partial<Plotly.Annotations>> = yearLabels.map((x) => ({
      x,
      yref: 'paper' as const,
      y: 1.05,
      text: String(x),
      showarrow: false,
      xanchor: 'center' as const,
      yanchor: 'bottom' as const,
    }));

    const labelsWithTotal = [...yearLabels, 'Net Δ'];
    const traceData = buildWaterfallTrace(labelsWithTotal, yValues, measure, customdata, productColors);

    return { trace: traceData, topYearAnnotations: annotations };
  }, [deltas, yearLabels, yearSet, keysUsed, prevTotal, selTotal, seriesData]);

  const notEnoughYears = yearSet.length < 2;

  return (
    <div className="card">
      <div className="plot-controls">
        <Select
          id="dairy-waterfall-product"
          label="Product-picker"
          value={selectedProduct}
          onChange={(v) => setSelectedProduct(v as (typeof PRODUCT_KEYS)[number])}
          options={DAIRY_RETAIL_OPTIONS}
        />
      </div>
      {notEnoughYears ? (
        <div className="empty-state">Not enough years of data to compute yearly changes</div>
      ) : (
        <Plot
          data={[trace]}
          layout={{
            height,
            title: { text: '<b>Yearly Changes in Retail Product Prices</b>', font: plotTitle },
            xaxis: { showticklabels: false },
            yaxis: { title: { text: 'Change (CZK)' } },
            showlegend: false,
            margin: movePlotDown(plotMargin), // to accommodate the year annotations
            annotations: topYearAnnotations,
          }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}
