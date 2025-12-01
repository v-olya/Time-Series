import { AllDairyKeys, MilkChannelsKey } from './types';

export const aggregationOptions = [
  { value: 'raw', label: 'Raw data' },
  { value: 'average', label: 'Average' },
  { value: 'sum', label: 'Sum' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'median', label: 'Median' },
  { value: 'p95', label: 'P95' },
];

export const intervalOptions = [
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const SEASONS_ORDER = ['Winter', 'Spring', 'Summer', 'Autumn'] as const;

export const plotLegend = {
  orientation: 'h' as const,
  x: 0.04,
  xanchor: 'left' as const,
  y: 1,
  yanchor: 'top' as const,
  bgcolor: 'rgba(255,255,255,0.6)',
  bordercolor: '#ccc',
  borderwidth: 1,
};
export const plotTitle =  { family: 'Montserrat, Arial, sans-serif', size: 20 };
export const plotMargin = { l: 90, r: 30, t: 90, b: 80 };
export const movePlotDown = (margins: typeof plotMargin): typeof plotMargin => {
  return { ...margins, t: (margins.t ?? 0) + 35, b: 20 };
};


export const MILK_ONLY_KEYS: Record<MilkChannelsKey, string> = {
  milk_p: 'P  mléko polotučné [l]_timeseries',
  milk_s: 'S  mléko polotučné pasterované [l]_timeseries',
  milk_z: 'Z  mléko kravské q. tř. j. [l]_timeseries',
};

export const DAIRY_RETAIL_KEYS: Record<string, string> = {
  milk_s: 'S  mléko polotučné pasterované [l]_timeseries',
  edam_s: 'S  eidamská cihla [kg]_timeseries',
  butter_s: 'S  máslo [kg]_timeseries',
};

export const DAIRY_RETAIL_OPTIONS = [
  { value: 'dairyIndex', label: 'Dairy Index' },
  { value: 'milk_s', label: 'Milk (S)' },
  { value: 'edam_s', label: 'Edam (S)' },
  { value: 'butter_s', label: 'Butter (S)' },
];
export const getChannelLabelFor = (s: string): Record<string, string> => { return {
  [`${s}_p`]: 'Industry (P)',
  [`${s}_s`]: 'Retail (S)',
  [`${s}_z`]: 'Farm-gate (Z)',
};};

export function productKeyToSeriesKey(key: AllDairyKeys) {
  switch (key) {
    case 'milk_p':
      return 'P  mléko polotučné [l]_timeseries';
    case 'milk_s':
      return 'S  mléko polotučné pasterované [l]_timeseries';
    case 'milk_z':
      return 'Z  mléko kravské q. tř. j. [l]_timeseries';
    case 'butter_p':
      return 'P  máslo [kg]_timeseries';
    case 'butter_s':
      return 'S  máslo [kg]_timeseries';
    case 'edam_p':
      return 'P  eidamská cihla [kg]_timeseries';
    case 'edam_s':
      return 'S  eidamská cihla [kg]_timeseries';
    default:
      return '';
  }
}

export const ALL_DAIRY_LABELS: Record<AllDairyKeys, string> = {
  milk_p: 'Milk (P)',
  milk_s: 'Milk (S)',
  milk_z: 'Milk (Z)',
  butter_p: 'Butter (P)',
  butter_s: 'Butter (S)',
  edam_p: 'Edam (P)',
  edam_s: 'Edam (S)',
};

export type FlourProductKey = 'flour_bread_p' | 'flour_00_p' | 'flour_s' | 'wheat_z';

export const DAIRY_RADAR_KEYS: AllDairyKeys[] = ['butter_s', 'edam_s', 'butter_p', 'edam_p'];
export const DAIRY_RADAR_COLOR_KEYS = ['plotlyRed', 'plotlyBlue', 'plotlyGreen', 'plotlyYellow'] as const;

export const FLOUR_PRODUCT_LABELS: Record<FlourProductKey, string> = {
  flour_bread_p: 'Bread flour',
  flour_00_p: 'Smooth (P)',
  flour_s: 'Smooth (S)',
  wheat_z: 'Grain',
};

export const FLOUR_PRODUCT_CHANNELS: Record<FlourProductKey, string> = {
  flour_bread_p: 'Industrial (P), Bread flour',
  flour_00_p: 'Industrial (P), Smooth flour',
  flour_s: 'Retail (S), Smooth flour',
  wheat_z: 'Wheat grain (Z)',
};

export const FLOUR_PRODUCT_SERIES_MAPPING: Record<FlourProductKey, string> = {
  flour_s: 'S  pšeničná mouka hladká [kg]_timeseries',
  flour_00_p: 'P  pšeničná mouka hladká 00 extra [kg]_timeseries',
  flour_bread_p: 'P  pšeničná mouka chlebová [kg]_timeseries',
  wheat_z: 'Z  pšenice potravinářská [kg]_timeseries',
};

export const FLOUR_RADAR_KEYS: FlourProductKey[] = ['flour_s', 'flour_00_p', 'flour_bread_p', 'wheat_z'];
export const FLOUR_RADAR_COLOR_KEYS = ['plotlyOrange', 'plotlyGreen', 'plotlyBlue', 'plotlyYellow'] as const;

export type EggProductKey = 'eggs_s' | 'eggs_z';

export const EGG_PRODUCT_LABELS: Record<EggProductKey, string> = {
  eggs_s: 'Retail price',
  eggs_z: 'Farm price',
};

export const EGG_PRODUCT_SERIES_MAPPING: Record<EggProductKey, string> = {
  eggs_s: 'S  vejce slepičí čerstvá [ks]_timeseries',
  eggs_z: 'Z  vejce slepičí konzumní tříděná [ks]_timeseries',
};

export const EGG_RADAR_KEYS: EggProductKey[] = ['eggs_s', 'eggs_z'];
export const EGG_RADAR_COLOR_KEYS = ['plotlyOrange', 'plotlyGreen'] as const;

export const DAIRY_PRODUCT_COLOR_KEYS = {
  butter_p: 'plotlyGreen',
  butter_s: 'plotlyRed',
  edam_p: 'plotlyBrown',
  edam_s: 'plotlyBlue',
} as const;

export const MILK_CHANNEL_COLOR_KEYS = {
  milk_p: 'plotlyGreen',
  milk_s: 'plotlyOrange',
  milk_z: 'plotlyBlue',
} as const;

export const MILK_CHANNEL_FUNNEL_COLOR_KEYS = {
  milk_p: 'plotlyGreen',
  milk_s: 'plotlyYellow',
  milk_z: 'plotlyBlue',
} as const;

export const FLOUR_PRODUCT_COLOR_KEYS = {
  flour_bread_p: 'plotlyBlue',
  flour_00_p: 'plotlyGreen',
  flour_s: 'plotlyOrange',
  wheat_z: 'plotlyYellow',
} as const;

export const EGG_PRODUCT_COLOR_KEYS = {
  eggs_s: 'plotlyOrange',
  eggs_z: 'plotlyGreen',
} as const;

export const WATERFALL_COLOR_KEYS = {
  increased: 'plotlyRed',
  decreased: 'plotlyGreen',
  neutral: '#999',
} as const;

export const HEATMAP_TITLE = 'Seasonal Heat Map of Retail Prices and the Aggregate Index';