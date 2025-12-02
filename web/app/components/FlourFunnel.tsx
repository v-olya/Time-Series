'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { mapColorsToPalette } from '../lib/helpers';
import { PALETTE } from '../lib/generatedPalette';
import { Funnel } from './Plots/Funnel';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, MILK_CHANNEL_FUNNEL_COLOR_KEYS } from '../lib/const';

type Props = { data: ProcessedData; height?: number };

const CHANNEL_ORDER = ['wheat_z', 'flour_00_p', 'flour_s'];

export function FlourFunnel({ data, height = 420 }: Props) {

  const mapping = {
    wheat_z: FLOUR_PRODUCT_SERIES_MAPPING.wheat_z,
    flour_00_p: FLOUR_PRODUCT_SERIES_MAPPING.flour_00_p,
    flour_s: FLOUR_PRODUCT_SERIES_MAPPING.flour_s,
  } as const;

  // Use same funnel colors as dairy (farm-gate -> industry -> retail)
  const milkColors = mapColorsToPalette(MILK_CHANNEL_FUNNEL_COLOR_KEYS, PALETTE);

  const productColors = {
    wheat_z: milkColors.milk_z,
    flour_00_p: milkColors.milk_p,
    flour_s: milkColors.milk_s,
  } as Record<string, string>;

  return (
    <Funnel
      data={data}
      mapping={mapping}
      channelOrder={CHANNEL_ORDER}
      labels={FLOUR_PRODUCT_LABELS}
      colors={productColors}
      titleHTML="<b>Flour Prices Funnel:<br> Farm-gate → Industry  → Retail</b>"
      height={height}
    />
  );
}
