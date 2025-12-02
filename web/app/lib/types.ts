export type TimePoint = { date: string; value: number };
export type SeriesMap = Record<string, TimePoint[]>;

export type ForecastItem = {
  date: string;
  value: number | null;
  lower_85?: number | null;
  upper_85?: number | null;
  lower_95?: number | null;
  upper_95?: number | null;
  [k: string]: unknown;
};

type Decomposition = {
  trend?: TimePoint[];
  seasonal?: TimePoint[];
  resid?: TimePoint[];
};

export type ProcessedData = {
  meta?: { series?: string; category?: string };
  timeSeries: TimePoint[];
  forecast?: TimePoint[];
  forecasts?: Record<string, TimePoint[]>;
  // Forecast intervals by confidence level
  forecastIntervals?: Record<string, Record<string, { date: string; lower: number; upper: number }[]>>;
  series?: SeriesMap;
  decomposition?: Decomposition;
  rolling?: Record<string, TimePoint[]>;
};
export type MilkChannelsKey = 'milk_p' | 'milk_s' | 'milk_z';

export type AllDairyKeys = 'milk_p' | 'milk_s' | 'milk_z' | 'butter_p' | 'butter_s' | 'edam_p' | 'edam_s';

export type Palette = {
  plotlyBlue: string;
  plotlyOrange: string;
  plotlyGreen: string;
  plotlyRed: string;
  plotlyPurple: string;
  plotlyBrown: string;
  plotlyYellow: string;
};