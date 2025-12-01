'use client';

import type { ProcessedData } from '../lib/types';
import { DAIRY_RETAIL_KEYS, DAIRY_RETAIL_OPTIONS } from '../lib/const';
import { WaterfallYearly } from './Plots/WaterfallYearly';

type Props = { data: ProcessedData; height?: number };

export function DairyWaterfall({ data, height = 420 }: Props) {
  return (
    <WaterfallYearly
      data={data}
      indexKey="dairyIndex"
      seriesMapping={DAIRY_RETAIL_KEYS}
      options={DAIRY_RETAIL_OPTIONS}
      title="<b>Yearly Changes in Retail Product Prices</b>"
      height={height}
    />
  );
}
