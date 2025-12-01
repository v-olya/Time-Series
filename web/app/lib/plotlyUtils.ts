import type { TimePoint } from './types';
import { getPalette, averageYear, hexToRgba } from './helpers';
import type { FlourProductKey } from './const';
import type * as Plotly from 'plotly.js';
import type { ScatterData } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';

export function scatterTrace(
  x: Array<string | number | Date>,
  y: Array<number | null>,
  name: string | undefined = undefined,
  opacity = 1,
): Partial<PlotParams & ScatterData> {
  return { x, y, type: 'scatter', mode: 'lines', name, opacity } as Partial<PlotParams & ScatterData>;
}

// Build a standard lines+markers trace from a TimePoint series
export function buildSeriesLineTrace(
  points: TimePoint[] | undefined,
  name: string,
  color: string,
  markerSize = 6,
  lineWidth = 2,
  dash?: string,
  mode: 'lines' | 'lines+markers' = 'lines+markers',
): Plotly.Data {
  const pts = points || [];
  return {
    x: pts.map((p) => p.date),
    y: pts.map((p) => p.value),
    type: 'scatter' as const,
    mode,
    name,
    line: { color, width: lineWidth, ...(dash ? { dash } : {}) },
    marker: { size: markerSize, color },
    hovertemplate: `%{x|%b %Y} ${name}: %{y:.2f}<extra></extra>`,
  } as Plotly.Data;
}

// Build scatter traces for seasons: `buckets` is a map of season->points
export function buildSeasonScatterTraces(
  buckets: Record<string, { x: number[]; y: number[]; text: string[] }>,
  seasonColors: Record<string, string>,
  hoverSuffix: string,
  seasonOrder: readonly string[] = ['Winter', 'Spring', 'Summer', 'Autumn'],
): Plotly.Data[] {
  const traces: Plotly.Data[] = [];
  seasonOrder.forEach((season) => {
    const pts = buckets[season] as { x: number[]; y: number[]; text: string[] } | undefined;
    if (pts && pts.x.length > 0) {
      traces.push({
        x: pts.x,
        y: pts.y,
        mode: 'markers',
        type: 'scatter',
        name: season,
        marker: { size: 8, color: seasonColors[season], opacity: 0.85 },
        text: pts.text,
        hovertemplate: '%{text}<br>Farm-gate (Z): %{x} CZK<br>' + `${hoverSuffix}: %{y} CZK<extra></extra>`,
      } as Plotly.Data);
    }
  });
  return traces;
}

export type WaterfallCustomDatum = {
  prev: number | null;
  sel: number | null;
  delta: number | null;
  label?: string;
};

// Build a waterfall trace with customdata
export function buildWaterfallTrace(
  labels: Array<string | number>,
  y: number[],
  measure: string[],
  customdata: WaterfallCustomDatum[],
  colors: { increased: string; decreased: string; neutral?: string },
): Plotly.Data {
  const encodedCustomdata = customdata
    .map((entry) => [entry.sel ?? null, entry.prev ?? null, entry.delta ?? null, entry.label ?? '']) as Plotly.Datum[][];
  return {
    type: 'waterfall',
    x: labels,
    y,
    measure,
    text: y.map((v) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))),
    textposition: 'outside',
    increasing: { marker: { color: colors.increased } },
    decreasing: { marker: { color: colors.decreased } },
    totals: { marker: { color: colors.neutral ?? '#666' } },
    customdata: encodedCustomdata,
    hovertemplate:
      '%{customdata[3]}: %{customdata[0]:.2f} CZK (prev %{customdata[1]:.2f})<br>Δ %{customdata[2]:.2f} CZK<extra></extra>',
  } as Plotly.Data;
}

export function average(arr: number[]) {
  if (!arr || arr.length === 0) return NaN;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export function averageForYear(points: TimePoint[] | undefined, year: string) {
  if (!points || !year) return NaN;
  const vals = points
    .filter((p) => typeof p.value === 'number' && p.date?.startsWith(year))
    .map((p) => p.value) as number[];
  if (vals.length === 0) return NaN;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

// Radar (scatterpolar) traces for a set of products
export function buildRadarTraces(
  seriesMap: Record<string, TimePoint[] | undefined>,
  productSeriesMapping: Record<FlourProductKey, string>,
  productLabels: Record<FlourProductKey, string>,
  years: number[],
  palette?: Record<string, string>,
): Plotly.ScatterData[] {
  const pal = palette || getPalette();
  const prodKeys = Object.keys(productSeriesMapping) as FlourProductKey[];
  const paletteVals = Object.values(pal);
  return prodKeys.map((k, idx) => {
    const seriesKey = productSeriesMapping[k];
    const pts = seriesMap[seriesKey] as TimePoint[] | undefined;
    const r = averageYear(pts, years).map((v) => (v === null ? 0 : (v as number)));
    const color = paletteVals[idx % paletteVals.length] || pal.plotlyBrown;
    return {
      type: 'scatterpolar',
      r,
      theta: years.map(String),
      fill: 'toself',
      name: productLabels[k] || String(k),
      marker: { color },
    } as Plotly.ScatterData;
  });
}

// Generic builder for radar traces when callers provide explicit items with label and color
export type RadarItem = { seriesKey: string; label: string; color?: string };
export function buildCustomRadarTraces(
  seriesMap: Record<string, TimePoint[] | undefined>,
  items: RadarItem[],
  years: number[],
  palette?: Record<string, string>,
): Plotly.ScatterData[] {
  const pal = palette || getPalette();
  return items.map((it, idx) => {
    const pts = seriesMap[it.seriesKey] as TimePoint[] | undefined;
    const r = averageYear(pts, years).map((v) => (v === null ? 0 : (v as number)));
    const color = it.color || Object.values(pal)[idx % Object.values(pal).length] || pal.plotlyBrown;
    return {
      type: 'scatterpolar',
      r,
      theta: years.map(String),
      fill: 'toself',
      name: it.label,
      marker: { color },
    } as Plotly.ScatterData;
  });
}

// Build a funnel trace
export function buildFunnelTrace(
  yLabels: string[],
  xValues: number[],
  textValues: string[],
  colors: string[],
  customdata?: Plotly.Datum[],
  hovertemplate = '%{y}: %{x:.2f} CZK (%{customdata:.0f}%)<extra></extra>',
): Plotly.Data {
  return {
    type: 'funnel' as const,
    y: yLabels,
    x: xValues,
    text: textValues,
    textinfo: 'text',
    textfont: { size: 13.5 },
    textposition: 'inside',
    marker: { color: colors },
    customdata,
    hovertemplate,
  } as Plotly.Data;
}

export function buildForecastTraces(
  points: TimePoint[] | undefined,
  interval95?: { date: string; lower: number; upper: number }[] | undefined,
  color?: string,
  name?: string,
): Plotly.Data[] {
  if (!points || points.length === 0) return [];

  const forecastLine = {
    x: points.map((p) => p.date),
    y: points.map((p) => p.value),
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: name ? `${name} (forecast)` : 'Forecast',
    line: { color: color || '#000', width: 2, dash: 'dash' },
    showlegend: false,
    legendgroup: name ?? 'forecast',
    hovertemplate: `%{x|%b %Y} ${name ? name + ' ' : ''}forecast: %{y:.2f}<extra></extra>`,
  } as Plotly.Data;

  if (!interval95 || interval95.length === 0) return [forecastLine];

  // Build a single polygon trace for the filled band: upper followed by reversed lower.
  const [dates, upper, lower] = interval95.reduce<[string[], number[], number[]]>(
    (acc, { date, upper: u, lower: l }) => {
      acc[0].push(date);
      acc[1].push(u);
      acc[2].push(l);
      return acc;
    },
    [[], [], []],
  );

  const fillColor = color ? hexToRgba(color, 0.18) : undefined;

  const bandX = [...dates, ...dates.slice().reverse()];
  const bandY = [...upper, ...lower.slice().reverse()];

  const bandTrace = {
    x: bandX,
    y: bandY,
    type: 'scatter',
    mode: 'lines',
    fill: 'toself',
    ...(fillColor ? { fillcolor: fillColor } : {}),
    line: { width: 0 },
    hoverinfo: 'skip',
    showlegend: false,
  } as Plotly.Data;

  return [forecastLine, bandTrace];
}
