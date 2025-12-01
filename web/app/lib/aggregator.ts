import type { TimePoint } from './types';

export type AggregationMethod = 'raw' | 'average' | 'min' | 'max' | 'median';

function applyAggregation(values: number[], method: AggregationMethod): number {
  if (method === 'raw' || values.length === 0) {
    return values[values.length - 1] ?? 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  switch (method) {
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'min':
      return sorted[0] ?? 0;
    case 'max':
      return sorted[sorted.length - 1] ?? 0;
    case 'median': {
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? (sorted[mid - 1] + sorted[mid]) / 2
        : sorted[mid];
    }
    default:
      return values[0] ?? 0;
  }
}

function monthKey(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${mm}`;
}

export function aggregateSeries(
  points: TimePoint[],
  aggregationMethod: AggregationMethod,
): TimePoint[] {
  // Raw: return original monthly series
  if (aggregationMethod === 'raw') {
    return points.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Non-raw: aggregate by calendar year
  const grouped: Record<string, number[]> = {};

  points.forEach((point) => {
    const date = new Date(point.date);
    const key = `${date.getFullYear()}`;

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(point.value);
  });

  return Object.entries(grouped)
    .map(([date, values]) => ({ date, value: applyAggregation(values, aggregationMethod) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
