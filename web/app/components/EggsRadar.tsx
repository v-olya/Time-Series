'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { EGG_PRODUCT_SERIES_MAPPING, EGG_PRODUCT_LABELS, EGG_RADAR_KEYS, EGG_RADAR_COLOR_KEYS } from '../lib/const';
import { getPalette } from '../lib/helpers';
import type { Palette } from '../lib/types';
import { RadarYearly, type RadarItem } from './Plots/RadarYearly';

type Props = { data: ProcessedData; height?: number };

export function EggsRadar({ data, height = 520 }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const items: RadarItem[] = useMemo(() =>
    EGG_RADAR_KEYS.map((k, i) => ({
      seriesKey: EGG_PRODUCT_SERIES_MAPPING[k],
      label: EGG_PRODUCT_LABELS[k],
      color: PALETTE[EGG_RADAR_COLOR_KEYS[i] as keyof Palette],
    })), [PALETTE]);

  return (
    <RadarYearly
      data={data}
      items={items}
      title='<b>Average Yearly Prices<br> Chicken Eggs</b>'
      height={height}
    />
  );
}