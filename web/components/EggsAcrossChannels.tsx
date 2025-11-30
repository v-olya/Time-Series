'use client';

import { useMemo, useCallback } from 'react';
import type { ProcessedData } from '../lib/types';
import { getPalette, mapColorsToPalette } from '../lib/helpers';
import { TimeSeries } from './Plots/TimeSeries';
import { EGG_PRODUCT_SERIES_MAPPING, EGG_PRODUCT_LABELS, EGG_PRODUCT_COLOR_KEYS } from '../lib/const';

type Props = { data: ProcessedData; height?: number };

export function EggsAcrossChannels({ data, height = 520 }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const productColors = mapColorsToPalette(EGG_PRODUCT_COLOR_KEYS, PALETTE);

  return (
    <TimeSeries
      data={data}
      height={height}
      productKeys={['eggs_s', 'eggs_z']}
      seriesMapping={EGG_PRODUCT_SERIES_MAPPING}
      productLabels={EGG_PRODUCT_LABELS}
      colors={productColors}
      title="<b>Chicken Egg Prices Across Distribution Channels</b>"
      yAxisTitle="Price per piece (CZK)"
      enableProductSelection={false}
    />
  );
}