"use client";

import type { ProcessedData } from '../lib/types';
import Funnel from './FunnelDefault';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS } from '../lib/const';
import { getMilkChannelColors } from '../lib/plotlyUtils';

type Props = { data: ProcessedData; height?: number };

const CHANNEL_ORDER = ['wheat_z', 'flour_00_p', 'flour_s'];

export function FlourFunnel({ data, height = 420 }: Props) {
  const mapping = {
    wheat_z: FLOUR_PRODUCT_SERIES_MAPPING.wheat_z,
    flour_00_p: FLOUR_PRODUCT_SERIES_MAPPING.flour_00_p,
    flour_s: FLOUR_PRODUCT_SERIES_MAPPING.flour_s,
  } as const;

  // Use same funnel colors as dairy (farm-gate -> industry -> retail)
  const getColors = () => {
    const milk = getMilkChannelColors('funnel');
    return {
      wheat_z: milk.milk_z,
      flour_00_p: milk.milk_p,
      flour_s: milk.milk_s,
    } as Record<string, string>;
  };

  return (
    <Funnel
      data={data}
      mapping={mapping}
      channelOrder={CHANNEL_ORDER}
      labels={FLOUR_PRODUCT_LABELS}
      getColors={getColors}
      titleHTML="<b>Flour Prices Funnel:<br> Farm-gate → Industry  → Retail</b>"
      height={height}
    />
  );
}
