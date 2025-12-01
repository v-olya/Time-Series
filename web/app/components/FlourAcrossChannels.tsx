'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { getPalette, mapColorsToPalette } from '../lib/helpers';
import { TimeSeries } from './Plots/TimeSeries';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_CHANNELS, FLOUR_PRODUCT_COLOR_KEYS } from '../lib/const';

type Props = { data: ProcessedData; height?: number };

export function FlourAcrossChannels({ data, height = 520 }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const productColors = mapColorsToPalette(FLOUR_PRODUCT_COLOR_KEYS, PALETTE);

  return (
    <TimeSeries
      data={data}
      height={height}
      productKeys={['flour_bread_p', 'flour_00_p', 'flour_s', 'wheat_z']}
      seriesMapping={FLOUR_PRODUCT_SERIES_MAPPING}
      productLabels={FLOUR_PRODUCT_CHANNELS}
      colors={productColors}
      title="<b>Flour Prices Across Distribution Channels</b>"
      yAxisTitle="Price (CZK)"
      enableProductSelection={false}
    />
  );
}
