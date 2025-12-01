'use client';

import { Scatter } from './Plots/Scatter';
import { EGG_PRODUCT_LABELS, EGG_PRODUCT_SERIES_MAPPING, type EggProductKey } from '../lib/const';
import type { ProcessedData } from '../lib/types';

type Props = { data: ProcessedData; height?: number };

export function EggsScatter({ data, height = 480 }: Props) {
  const productOptions = (Object.keys(EGG_PRODUCT_LABELS) as EggProductKey[]).map((key) => ({
    value: EGG_PRODUCT_SERIES_MAPPING[key],
    label: EGG_PRODUCT_LABELS[key],
  }));

  return (
    <Scatter
      data={data}
      baseSeriesKey="" // Not used since options.length = 2
      productOptions={productOptions}
      baseLabel="" // Not used since options.length = 2
      height={height}
    />
  );
}