'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { getPalette, mapColorsToPalette } from '../lib/helpers';
import { getChannelLabelFor, MILK_ONLY_KEYS, MILK_CHANNEL_FUNNEL_COLOR_KEYS } from '../lib/const';
import { Funnel } from './Plots/Funnel';

type Props = { data: ProcessedData; height?: number };

const CHANNEL_ORDER = ['milk_z', 'milk_p', 'milk_s'];

export function MilkOnlyFunnel({ data, height = 420 }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const productColors = mapColorsToPalette(MILK_CHANNEL_FUNNEL_COLOR_KEYS, PALETTE);

  return (
    <Funnel
      data={data}
      mapping={MILK_ONLY_KEYS}
      channelOrder={CHANNEL_ORDER}
      labels={getChannelLabelFor('milk')}
      colors={productColors}
      titleHTML="<b>Milk Prices Funnel:<br> Farm-gate → Industry  → Retail</b>"
      height={height}
    />
  );
}

