'use client';
import type { ProcessedData } from '../lib/types';
import { productKeyToSeriesKey, ALL_DAIRY_LABELS } from 'app/lib/const';
import { PALETTE } from 'app/lib/generatedPalette';
import type { Palette } from 'app/lib/types';
import { RadarYearly, type RadarItem } from './Plots/RadarYearly';
import { DAIRY_RADAR_KEYS, DAIRY_RADAR_COLOR_KEYS } from 'app/lib/const';

type Props = { data: ProcessedData; height: number };

export function DairyRadar({ data, height }: Props) {

  const items: RadarItem[] =
    DAIRY_RADAR_KEYS.map((k, i) => ({
      seriesKey: productKeyToSeriesKey(k),
      label: ALL_DAIRY_LABELS[k],
      color: PALETTE[DAIRY_RADAR_COLOR_KEYS[i] as keyof Palette],
    }));

  return (
    <RadarYearly
      data={data}
      items={items}
      title='<b>Average Yearly Prices<br> Retail (S) and Industry (P)</b>'
      height={height}
    />
  );
}
