'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, type FlourProductKey } from '../lib/const';
import { Scatter } from './Plots/Scatter';

type Props = { data: ProcessedData; height?: number };

const productOptions = (
  (Object.keys(FLOUR_PRODUCT_SERIES_MAPPING) as FlourProductKey[])
    .filter((k) => k !== 'wheat_z') // Exclude wheat_z since it's the base
).map((k) => ({ value: FLOUR_PRODUCT_SERIES_MAPPING[k], label: FLOUR_PRODUCT_LABELS[k] || k }));

export function FlourScatter({ data, height = 480 }: Props) {
  return (
    <Scatter
      data={data}
      baseSeriesKey={FLOUR_PRODUCT_SERIES_MAPPING.wheat_z}
      productOptions={productOptions}
      baseLabel="Wheat grain"
      height={height}
    />
  );
}
