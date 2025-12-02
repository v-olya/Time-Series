import fs from 'fs';
import path from 'path';
import type { ProcessedData, TimePoint } from './types';

type ForecastItem = {
  date: string;
  value: number | null;
  lower_85?: number | null;
  upper_85?: number | null;
  lower_95?: number | null;
  upper_95?: number | null;
  [k: string]: unknown;
};

type TinyFile = { forecasts?: Record<string, ForecastItem[]> };

export function mergeForecastsIntoData(data: ProcessedData, name: string): ProcessedData {
  const fcPath = path.join(process.cwd(), 'public', 'data', 'processed', `${name}_forecasts.json`);
  try {
    if (!fs.existsSync(fcPath)) return data;
    const raw = fs.readFileSync(fcPath, 'utf8');
    const tiny = JSON.parse(raw) as TinyFile;
    if (!tiny?.forecasts) return data;

    const converted: Record<string, TimePoint[]> = {};
    const intervals: Record<string, Record<'85' | '95', { date: string; lower: number; upper: number }[]>> = {};

    // helper: pick first present key and coerce to finite number or NaN
    const getNumeric = (obj: ForecastItem, ...keys: (keyof ForecastItem | string)[]): number => {
      const record = obj as unknown as Record<string, unknown>;
      const raw = keys.reduce<unknown | undefined>((acc, k) => acc ?? record[String(k)], undefined);
      if (raw == null) return NaN;
      const n = Number(raw);
      return Number.isFinite(n) ? n : NaN;
    };

    for (const [seriesKey, items] of Object.entries(tiny.forecasts)) {
      converted[seriesKey] = [];
      intervals[seriesKey] = { '85': [], '95': [] };
      for (const it of items || []) {
        if (!it || it.date == null) continue;
        const val = (it as ForecastItem).value;
        const numericValue = typeof val === 'number' ? val : Number(val);
        converted[seriesKey].push({ date: it.date, value: Number.isFinite(numericValue) ? numericValue : NaN });

        const [lower85, upper85, lower95, upper95] = [
          ['lower_85', 'lower85'],
          ['upper_85', 'upper85'],
          ['lower_95', 'lower95'],
          ['upper_95', 'upper95'],
        ].map((ks) => getNumeric(it as ForecastItem, ...(ks as [string, string])));

        intervals[seriesKey]['85'].push({ date: it.date, lower: lower85, upper: upper85 });
        intervals[seriesKey]['95'].push({ date: it.date, lower: lower95, upper: upper95 });
      }
    }
    data.forecasts = converted;
    data.forecastIntervals = intervals as unknown as ProcessedData['forecastIntervals'];

    return data;
  } catch (err) {
    return data;
  }
}
