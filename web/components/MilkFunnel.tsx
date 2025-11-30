"use client";

import type { ProcessedData } from '../lib/types';
import { getChannelLabelFor, MILK_ONLY_KEYS } from '../lib/const';
import { getMilkChannelColors } from '../lib/plotlyUtils';
import Funnel from './FunnelDefault';

type Props = { data: ProcessedData; height?: number };

const CHANNEL_ORDER = ['milk_z', 'milk_p', 'milk_s'];

export function MilkFunnel({ data, height = 420 }: Props) {
  return (
    <Funnel
      data={data}
      mapping={MILK_ONLY_KEYS}
      channelOrder={CHANNEL_ORDER}
      labels={getChannelLabelFor('milk')}
      getColors={() => getMilkChannelColors('funnel')}
      titleHTML="<b>Milk Prices Funnel:<br> Farm-gate → Industry  → Retail</b>"
      height={height}
    />
  );
}

