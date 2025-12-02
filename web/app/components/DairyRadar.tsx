'use client';
import type { ProcessedData, Palette } from '../lib/types';
import { productKeyToSeriesKey, ALL_DAIRY_LABELS, DAIRY_RADAR_KEYS, DAIRY_RADAR_COLOR_KEYS } from '../lib/const';
import { PALETTE } from '../lib/generatedPalette';
import { RadarYearly, type RadarItem } from './Plots/RadarYearly';

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
