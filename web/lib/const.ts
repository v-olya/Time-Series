import { MilkChannelsKey } from './types/types';

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

// Read the CSS variables at runtime to keep the single source of truth (`web/styles/global.css`)
export function getPalette() {
  // Guard for SSR: `document` and `getComputedStyle` are only available in the browser. 
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
    return {
      plotlyBlue: '',
      plotlyOrange: '',
      plotlyGreen: '',
      plotlyRed: '',
      plotlyPurple: '',
      plotlyBrown: '',
    };
  }
  const s = getComputedStyle(document.documentElement);
  const read = (name: string) => s.getPropertyValue(name).trim() || '';
  return {
    plotlyBlue: read('--plotly-blue'),
    plotlyOrange: read('--plotly-orange'),
    plotlyGreen: read('--plotly-green'),
    plotlyRed: read('--plotly-red'),
    plotlyPurple: read('--plotly-purple'),
    plotlyBrown: read('--plotly-brown'),
  };
}

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
export const plotMargin = { l: 90, r: 30, t: 90, b: 80 };
export const plotTitle =  { family: 'Montserrat, Arial, sans-serif', size: 20 };

export const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

export const getChannelsKeysFor = (s: string): Record<string, string> => { return {
  [`${s}_p`]: 'Industry (P)',
  [`${s}_s`]: 'Retail (S)',
  [`${s}_z`]: 'Farm-gate (Z)',
};};