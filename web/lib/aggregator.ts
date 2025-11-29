import type { TimePoint } from './types/types';

export type AggregationMethod = 'raw' | 'average' | 'sum' | 'min' | 'max' | 'median' | 'p95';
export type TimeInterval = 'month' | 'quarter' | 'year';

function applyAggregation(values: number[], method: AggregationMethod): number {
  if (method === 'raw' || values.length === 0) {
    return values[values.length - 1] ?? 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  switch (method) {
    case 'average':
      return values.reduce((a, b) => a + b, 0) / values.length;
    case 'sum':
      return values.reduce((a, b) => a + b, 0);
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
    case 'p95': {
      const index = Math.ceil(sorted.length * 0.95) - 1;
      return sorted[Math.max(0, Math.min(index, sorted.length - 1))] ?? 0;
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
  timeInterval: TimeInterval,
  aggregationMethod: AggregationMethod,
): TimePoint[] {
  if (timeInterval === 'month' && aggregationMethod === 'raw') {
    return points.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  const grouped: Record<string, number[]> = {};

  points.forEach((point) => {
    const date = new Date(point.date);
    let key: string;

    if (timeInterval === 'quarter') {
      const quarter = Math.floor(date.getMonth() / 3);
      key = `${date.getFullYear()}-Q${quarter + 1}`;
    } else if (timeInterval === 'year') {
      key = `${date.getFullYear()}`;
    } else {
      key = monthKey(date);
    }

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(point.value);
  });

  return Object.entries(grouped)
    .map(([date, values]) => ({ date, value: applyAggregation(values, aggregationMethod) }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export default aggregateSeries;
