'use client';

import type { ProcessedData } from '../lib/types';
import { mapColorsToPalette } from '../lib/helpers';
import { PALETTE } from '../lib/generatedPalette';
import { DAIRY_PRODUCT_COLOR_KEYS } from '../lib/const';
import { TimeSeries } from './Plots/TimeSeries';

type Props = { data: ProcessedData; height?: number };

type ProductKey = 'edam_p' | 'edam_s' | 'butter_p' | 'butter_s';

const PRODUCT_LABELS: Record<ProductKey, string> = {
  edam_p: 'Edam (P)',
  edam_s: 'Edam (S)',
  butter_p: 'Butter (P)',
  butter_s: 'Butter (S)',
};

const PRODUCT_SERIES_MAPPING: Record<ProductKey, string> = {
  edam_p: 'P  eidamská cihla [kg]_timeseries',
  edam_s: 'S  eidamská cihla [kg]_timeseries',
  butter_p: 'P  máslo [kg]_timeseries',
  butter_s: 'S  máslo [kg]_timeseries',
};

export function DairyAcrossChannels({ data, height = 600 }: Props) {
  const productColors = mapColorsToPalette(DAIRY_PRODUCT_COLOR_KEYS, PALETTE);

  return (
    <TimeSeries
      data={data}
      height={height}
      productKeys={['edam_p', 'edam_s', 'butter_p', 'butter_s']}
      seriesMapping={PRODUCT_SERIES_MAPPING}
      productLabels={PRODUCT_LABELS}
      colors={productColors}
      title="<b>Dairy Products Prices Across Distribution Channels</b>"
      yAxisTitle="Price per kg (CZK)"
      enableProductSelection={true}
      defaultSelectedProducts={['butter_p', 'butter_s']}
    />
  );
}
