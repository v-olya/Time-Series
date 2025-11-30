import type { TimePoint, MilkChannelsKey } from './types';
import { getPalette } from './const';
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
): Plotly.Data {
  const pts = points || [];
  return {
    x: pts.map((p) => p.date),
    y: pts.map((p) => p.value),
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    name,
    line: { color, width: lineWidth },
    marker: { size: markerSize, color },
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

// Build a waterfall trace with customdata
export function buildWaterfallTrace(
  labels: string[],
  y: number[],
  measure: string[],
  customdata: Plotly.Datum[],
  colors: { increased: string; decreased: string; neutral?: string },
): Plotly.Data {
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
    customdata,
    hovertemplate: '%{x}: %{customdata.sel:.2f} CZK (prev %{customdata.prev:.2f})<br>Δ %{customdata.delta:.2f} CZK<extra></extra>',
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

export function getDairyProductColors() {
  const p = getPalette();
  return {
    butter_p: p.plotlyGreen,
    butter_s: p.plotlyRed,
    edam_p: p.plotlyBrown,
    edam_s: p.plotlyBlue,
  } as const;
}

export function getWaterfallColors() {
  const p = getPalette();
  return {
    increased: p.plotlyRed,
    decreased: p.plotlyGreen,
    neutral: '#999',
  } as const;
}

export type MilkColorVariant = 'default' | 'funnel';
export function getMilkChannelColors(variant: MilkColorVariant = 'default') {
  const p = getPalette();
  return {
    milk_p: p.plotlyGreen,
    milk_s: variant === 'funnel' ? p.plotlyYellow : p.plotlyOrange,
    milk_z: p.plotlyBlue,
  } as Record<MilkChannelsKey, string>;
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
