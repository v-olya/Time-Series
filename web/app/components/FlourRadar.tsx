'use client';
import type { ProcessedData } from '../lib/types';
import { FLOUR_PRODUCT_SERIES_MAPPING, FLOUR_PRODUCT_LABELS, FLOUR_RADAR_KEYS, FLOUR_RADAR_COLOR_KEYS } from '../lib/const';
import { PALETTE } from '../lib/generatedPalette';
import type { Palette } from '../lib/types';
import { RadarYearly, type RadarItem } from './Plots/RadarYearly';

type Props = { data: ProcessedData; height?: number };

export function FlourRadar({ data, height = 520 }: Props) {

  const items: RadarItem[] =
    FLOUR_RADAR_KEYS.map((k, i) => ({
      seriesKey: FLOUR_PRODUCT_SERIES_MAPPING[k],
      label: FLOUR_PRODUCT_LABELS[k],
      color: PALETTE[FLOUR_RADAR_COLOR_KEYS[i] as keyof Palette],
    }));

  return (
    <RadarYearly
      data={data}
      items={items}
      title='<b>Average Yearly Prices<br> Wheat Flour</b>'
      height={height}
    />
  );
}
