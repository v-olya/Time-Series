'use client';

import { useMemo } from 'react';
import type { ProcessedData, MilkChannelsKey } from '../lib/types';
import { getPalette, mapColorsToPalette } from '../lib/helpers';
import { TimeSeries } from './Plots/TimeSeries';
import { MILK_ONLY_KEYS, MILK_CHANNEL_COLOR_KEYS } from '../lib/const';

type Props = { data: ProcessedData; height?: number };

const CHANNEL_LABELS: Record<MilkChannelsKey, string> = {
  milk_p: 'Industry (P)',
  milk_s: 'Retail (S)',
  milk_z: 'Farm-gate (Z)',
};

export function MilkOnlyAcrossChannels({ data, height = 500 }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const productColors = mapColorsToPalette(MILK_CHANNEL_COLOR_KEYS, PALETTE);

  return (
    <TimeSeries
      data={data}
      height={height}
      productKeys={['milk_z', 'milk_p', 'milk_s']}
      seriesMapping={MILK_ONLY_KEYS}
      productLabels={CHANNEL_LABELS}
      colors={productColors}
      title="<b>Milk Prices Across Distribution Channels</b>"
      yAxisTitle="Price per kg (CZK)"
      enableProductSelection={false}
    />
  );
}
