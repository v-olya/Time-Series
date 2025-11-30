'use client';

import type { ProcessedData } from '../lib/types';
import { DAIRY_RETAIL_KEYS, DAIRY_RETAIL_OPTIONS, HEATMAP_TITLE } from 'lib/const';
import { Heatmap } from './Plots/Heatmap';

type Props = { data: ProcessedData; height?: number };

export function DairyHeatmap({ data, height = 520 }: Props) {
  return (
    <Heatmap
      data={data}
      indexKey="dairyIndex"
      seriesMapping={DAIRY_RETAIL_KEYS}
      options={DAIRY_RETAIL_OPTIONS}
      title={`<b>${HEATMAP_TITLE}</b>`}
      height={height}
    />
  );
}
