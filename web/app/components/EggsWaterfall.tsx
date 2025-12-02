'use client';

import type { ProcessedData } from '../lib/types';
import { EGG_PRODUCT_SERIES_MAPPING, EGG_PRODUCT_LABELS, type EggProductKey } from '../lib/const';
import { WaterfallYearly } from './Plots/WaterfallYearly';

type Props = { data: ProcessedData; height?: number };

export function EggsWaterfall({ data, height = 420 }: Props) {
  const productOptions = [
    { value: 'eggsIndex', label: 'Eggs Index' },
    ...((Object.keys(EGG_PRODUCT_SERIES_MAPPING) as EggProductKey[])
      .map((k) => ({ value: k, label: EGG_PRODUCT_LABELS[k] || String(k) }))),
  ];

  return (
    <WaterfallYearly
      data={data}
      indexKey="eggsIndex"
      seriesMapping={EGG_PRODUCT_SERIES_MAPPING}
      options={productOptions}
      title="<b>Yearly Changes in Chicken Eggs Prices</b>"
      height={height}
    />
  );
}