'use client';

import type { ProcessedData } from '../lib/types';
import { EGG_PRODUCT_SERIES_MAPPING, EGG_PRODUCT_LABELS, type EggProductKey, HEATMAP_TITLE } from '../lib/const';
import { Heatmap } from './Plots/Heatmap';

type Props = { data: ProcessedData; height?: number };

export function EggsHeatmap({ data, height = 520 }: Props) {
  const productOptions = [
    { value: 'eggsIndex', label: 'Eggs index' },
    ...(Object.keys(EGG_PRODUCT_SERIES_MAPPING) as EggProductKey[]).map((k) => ({ value: k, label: EGG_PRODUCT_LABELS[k] || String(k) })),
  ];

  return (
    <Heatmap
      data={data}
      indexKey="eggsIndex"
      seriesMapping={EGG_PRODUCT_SERIES_MAPPING}
      options={productOptions}
      title={`<b>${HEATMAP_TITLE}</b>`}
      height={height}
    />
  );
}