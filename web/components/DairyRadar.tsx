'use client';

import { useMemo } from 'react';
import type { ProcessedData } from '../lib/types';
import { productKeyToSeriesKey, ALL_DAIRY_LABELS } from 'lib/const';
import { getPalette } from 'lib/helpers';
import type { Palette } from 'lib/types';
import { RadarYearly, type RadarItem } from './Plots/RadarYearly';
import { DAIRY_RADAR_KEYS, DAIRY_RADAR_COLOR_KEYS } from 'lib/const';

type Props = { data: ProcessedData; height: number };

export function DairyRadar({ data, height }: Props) {
  const PALETTE = useMemo(() => getPalette(), []);

  const items: RadarItem[] = useMemo(() =>
    DAIRY_RADAR_KEYS.map((k, i) => ({
      seriesKey: productKeyToSeriesKey(k),
      label: ALL_DAIRY_LABELS[k],
      color: PALETTE[DAIRY_RADAR_COLOR_KEYS[i] as keyof Palette],
    })), [PALETTE]);

  return (
    <RadarYearly
      data={data}
      items={items}
      title='<b>Average Yearly Prices<br> Retail (S) and Industry (P)</b>'
      height={height}
    />
  );
}
