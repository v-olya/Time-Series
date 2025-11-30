'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, type FlourProductKey, HEATMAP_TITLE } from 'lib/const';
import { Heatmap } from './Plots/Heatmap';

type Props = { data: ProcessedData; height?: number };

export function FlourHeatmap({ data, height = 520 }: Props) {
  const productOptions = useMemo(() => {
    const keys = Object.keys(FLOUR_PRODUCT_SERIES_MAPPING) as FlourProductKey[];
    return [{ value: 'flourIndex', label: 'Flour index' }, ...keys.map((k) => ({ value: k, label: FLOUR_PRODUCT_LABELS[k] || String(k) }))];
  }, []);

  return (
    <Heatmap
      data={data}
      indexKey="flourIndex"
      seriesMapping={FLOUR_PRODUCT_SERIES_MAPPING}
      options={productOptions}
      title={`<b>${HEATMAP_TITLE}</b>`}
      height={height}
    />
  );
}
