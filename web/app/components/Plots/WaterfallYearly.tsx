'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProcessedData, TimePoint } from '../../lib/types';
import { PALETTE } from '../../lib/generatedPalette';
import { Select } from '../UI/Select';
import { movePlotDown, plotMargin, plotTitle } from '../../lib/const';
import { averageForYear, buildWaterfallTrace, WaterfallCustomDatum } from '../../lib/plotlyUtils';
import { extractSeriesByMapping, getYearSetFromSeriesData } from '../../lib/helpers';
import type * as Plotly from 'plotly.js';

import PlotlyWrapper from './PlotlyWrapper';

type Props = {
  data: ProcessedData;
  indexKey: string;
  seriesMapping: Record<string, string>;
  options: { value: string; label: string }[];
  title: string;
  height?: number;
}

const productColors = { increased: PALETTE.plotlyRed, decreased: PALETTE.plotlyGreen, neutral: '#999' };

export function WaterfallYearly({
  data,
  indexKey,
  seriesMapping,
  options,
  title,
  height = 420,
}: Props) {

  const series = data.series;
  const seriesData = useMemo(() => {
    const extracted = extractSeriesByMapping(series, seriesMapping) || {};
    const base = { [indexKey]: (data.timeSeries || ([] as TimePoint[])) } as Record<string, TimePoint[]>;
    return { ...base, ...extracted } as Record<string, TimePoint[]>;
  }, [data.timeSeries, series, indexKey, seriesMapping]);

  const yearSet = useMemo(() => getYearSetFromSeriesData(seriesData), [seriesData]);

  const [selectedProduct, setSelectedProduct] = useState<string>(indexKey);

  const { deltas, keysUsed, yearLabels } = useMemo(() => {
    if (!yearSet || yearSet.length < 2) {
      return {
        deltas: [] as number[],
        keysUsed: [selectedProduct],
        yearLabels: [] as string[],
      };
    }

    const keysToUse = [selectedProduct];
    const deltasArr: number[] = [];
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

      deltasArr.push(curYearSum - prevYearSum);
    }

    return { deltas: deltasArr, keysUsed: keysToUse, yearLabels: labels };
  }, [seriesData, yearSet, selectedProduct]);

  const { trace, topYearAnnotations } = useMemo(() => {
    if (yearLabels.length === 0) {
      const emptyTrace = buildWaterfallTrace([], [], [], [] as WaterfallCustomDatum[], productColors);
      return { trace: emptyTrace, topYearAnnotations: [] };
    }

    const yValues = [...deltas];
    const measure = deltas.map(() => 'relative');

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
        label: curYear,
      };
    });

    const annotations: Array<Partial<Plotly.Annotations>> = yearLabels.map((label, idx) => ({
      x: idx,
      yref: 'paper' as const,
      y: 1.05,
      text: String(label),
      showarrow: false,
      xanchor: 'center' as const,
      yanchor: 'bottom' as const,
    }));

    const xValues = yearLabels.map((_, idx) => idx);
    const traceData = buildWaterfallTrace(xValues, yValues, measure, customdata, productColors);

    return { trace: traceData, topYearAnnotations: annotations };
  }, [deltas, yearLabels, yearSet, keysUsed, seriesData]);

  const notEnoughYears = yearSet.length < 2;

  if (notEnoughYears) {
    return <div className="empty-state">Not enough years of data to compute yearly changes</div>;
  }

  return (
    <div className="card">
      <div className="plot-controls">
        <Select
          id="waterfall-product"
          label="Product-picker"
          value={selectedProduct}
          onChange={(v) => setSelectedProduct(v)}
          options={options}
        />
      </div>
      <PlotlyWrapper
        data={[trace]}
        layout={{
          height,
          title: { text: title, font: plotTitle },
          xaxis: { showticklabels: false },
          yaxis: { title: { text: 'Change (CZK)' } },
          showlegend: false,
          margin: movePlotDown(plotMargin),
          annotations: topYearAnnotations,
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}