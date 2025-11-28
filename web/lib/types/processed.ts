export type TimePoint = { date: string; value: number };
export type SeriesMap = Record<string, TimePoint[]>;
export type Decomposition = {
  trend?: TimePoint[];
  seasonal?: TimePoint[];
  resid?: TimePoint[];
};
export type ProcessedData = {
  meta?: { series?: string; category?: string };
  observed: TimePoint[];
  forecast?: TimePoint[];
  series?: SeriesMap;
  decomposition?: Decomposition;
  rolling?: Record<string, TimePoint[]>;
};
