'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, type FlourProductKey } from '../lib/const';
import { WaterfallYearly } from './Plots/WaterfallYearly';

type Props = { data: ProcessedData; height?: number };

export function FlourWaterfall({ data, height = 420 }: Props) {
  const productOptions = useMemo(() => [
    { value: 'flourIndex', label: 'Flour Index' },
    ...((Object.keys(FLOUR_PRODUCT_SERIES_MAPPING) as FlourProductKey[])
      .map((k) => ({ value: k, label: FLOUR_PRODUCT_LABELS[k] || String(k) }))),
  ], []);

  return (
    <WaterfallYearly
      data={data}
      indexKey="flourIndex"
      seriesMapping={FLOUR_PRODUCT_SERIES_MAPPING}
      options={productOptions}
      title="<b>Yearly Changes in Wheat Flour Prices</b>"
      height={height}
    />
  );
}
