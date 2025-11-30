'use client';

import type { AllDairyKeys, ProcessedData } from '../lib/types';
import { productKeyToSeriesKey, ALL_DAIRY_LABELS } from '../lib/const';
import { Scatter } from './Plots/Scatter';

type Props = { data: ProcessedData; height: number };

const productOptions = (Object.keys(ALL_DAIRY_LABELS) as AllDairyKeys[])
  .filter((k) => k !== 'milk_z')
  .map((k) => ({ value: productKeyToSeriesKey(k), label: ALL_DAIRY_LABELS[k] }));

export function DairyScatter({ data, height }: Props) {
  return (
    <Scatter
      data={data}
      baseSeriesKey={productKeyToSeriesKey('milk_z')}
      productOptions={productOptions}
      baseLabel="Farm-gate Milk"
      height={height}
    />
  );
}
