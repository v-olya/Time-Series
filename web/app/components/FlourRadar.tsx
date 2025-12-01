'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, FLOUR_RADAR_KEYS, FLOUR_RADAR_COLOR_KEYS } from '../lib/const';
import { getPalette } from '../lib/helpers';
import type { Palette } from '../lib/types';
import { RadarYearly, type RadarItem } from './Plots/RadarYearly';

type Props = { data: ProcessedData; height?: number };

export function FlourRadar({ data, height = 520 }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const items: RadarItem[] = useMemo(() =>
    FLOUR_RADAR_KEYS.map((k, i) => ({
      seriesKey: FLOUR_PRODUCT_SERIES_MAPPING[k],
      label: FLOUR_PRODUCT_LABELS[k],
      color: PALETTE[FLOUR_RADAR_COLOR_KEYS[i] as keyof Palette],
    })), [PALETTE]);

  return (
    <RadarYearly
      data={data}
      items={items}
      title='<b>Average Yearly Prices<br> Wheat Flour</b>'
      height={height}
    />
  );
}
