import type { ProcessedData, TimePoint, Palette } from './types';

export function getPalette(): Palette {
  // Guard for SSR: `document` and `getComputedStyle` are only available in the browser.
  if (typeof window === 'undefined' || typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
    return {
      plotlyBlue: '',
      plotlyOrange: '',
      plotlyGreen: '',
      plotlyRed: '',
      plotlyPurple: '',
      plotlyBrown: '',
      plotlyYellow: '',
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
    plotlyYellow: read('--plotly-yellow'),
  } as Palette;
}

export function pearson(xs: number[], ys: number[]) {
  if (xs.length === 0 || ys.length === 0 || xs.length !== ys.length) return 0;
  const n = xs.length;
  const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const mx = mean(xs);
  const my = mean(ys);
  let num = 0;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    sx += dx * dx;
    sy += dy * dy;
  }
  const denom = Math.sqrt(sx * sy);
  if (denom === 0) return 0;
  return num / denom;
}

export  function monthToSeason(monthIndex: number) {
  if (monthIndex === 11 || monthIndex === 0 || monthIndex === 1) return 'Winter';
  if (monthIndex >= 2 && monthIndex <= 4) return 'Spring';
  if (monthIndex >= 5 && monthIndex <= 7) return 'Summer';
  return 'Autumn';
}

export function getSeasonColors(): Record<string, string> {
  const p = getPalette();
  return {
    Winter: p.plotlyBlue,
    Spring: p.plotlyGreen,
    Summer: p.plotlyYellow,
    Autumn: p.plotlyRed,
  } as Record<string, string>;
}
// Returns years array and z matrix (months x years). Used for heatmaps.
export function buildSeasonalMatrix(seriesPoints: TimePoint[] | undefined) {
  const map = new Map<number, Map<number, number[]>>();
  (seriesPoints || []).forEach((pt) => {
    const d = new Date(pt.date);
    if (Number.isNaN(d.getTime())) return;
    const y = d.getFullYear();
    const m = d.getMonth();
    if (!map.has(y)) map.set(y, new Map());
    const months = map.get(y)!;
    if (!months.has(m)) months.set(m, []);
    months.get(m)!.push(pt.value as number);
  });

  const yearsArr = Array.from(map.keys()).sort((a, b) => a - b);
  const zMatrix: (number | null)[][] = [];

  const avg = (arr: number[]) => (arr.length === 0 ? NaN : arr.reduce((a, b) => a + b, 0) / arr.length);

  yearsArr.forEach((y) => {
    const months = map.get(y)!;
    const row: (number | null)[] = [];
    for (let m = 0; m < 12; m++) {
      const vals = months.get(m) || [];
      const v = vals.length ? avg(vals as number[]) : NaN;
      row.push(Number.isNaN(v) ? null : parseFloat(v.toFixed(2)));
    }
    zMatrix.push(row);
  });

  return { years: yearsArr, z: zMatrix };
}
// Extracts series entries from a processed map using a mapping where keys are desired channel keys

export function extractSeriesByMapping<K extends string = string>(
  series: ProcessedData['series'] | undefined,
  mapping: Record<K, string>,
): Record<K, TimePoint[]> | null {
  if (!series) return null;
  return Object.fromEntries(
    (Object.keys(mapping) as K[]).map((k) => [k, (series[mapping[k]] || []) as TimePoint[]]),
  ) as Record<K, TimePoint[]>;
}

export function averageYear(series: TimePoint[] | undefined, years: number[]) {
  const yearMap = new Map<number, { sum: number; count: number }>();
  years.forEach((y) => yearMap.set(y, { sum: 0, count: 0 }));

  (series || []).forEach((pt) => {
    const d = new Date(pt.date);
    if (Number.isNaN(d.getTime())) return;
    const y = d.getFullYear();
    if (yearMap.has(y) && typeof pt.value === 'number') {
      const entry = yearMap.get(y)!;
      entry.sum += pt.value;
      entry.count += 1;
    }
  });

  return years.map((y) => {
    const entry = yearMap.get(y);
    if (!entry || entry.count === 0) return null;
    return parseFloat((entry.sum / entry.count).toFixed(2));
  });
}

// Return a sorted array of year strings found in provided data
export function getYearSetFromSeriesData(seriesData: Record<string, TimePoint[]> | null | undefined): string[] {
  if (!seriesData) return [];
  const s = new Set<string>();
  Object.values(seriesData).forEach((arr) => {
    arr.forEach((tp) => {
      if (tp && typeof tp.date === 'string') s.add(tp.date.slice(0, 4));
    });
  });
  return Array.from(s).sort();
}

// Align two time series by date and return numeric pairs and labels
export function alignSeriesByDate(a: TimePoint[] | undefined, b: TimePoint[] | undefined) {
  const mapA = new Map<string, number>();
  (a || []).forEach((p) => {
    if (typeof p.value === 'number') mapA.set(p.date, p.value);
  });
  const xs: number[] = [];
  const ys: number[] = [];
  const labels: string[] = [];
  (b || []).forEach((p) => {
    const av = mapA.get(p.date);
    if (typeof av === 'number' && typeof p.value === 'number') {
      xs.push(av);
      ys.push(p.value);
      labels.push(p.date);
    }
  });
  return { xs, ys, labels };
}
export function mapColorsToPalette(colorKeys: Record<string, string>, palette: Palette): Record<string, string> {
  return Object.fromEntries(
    Object.entries(colorKeys).map(([k, pk]) => [k, palette[pk as keyof Palette] || pk]),
  );
}

// Convert hex or rgb color string to rgba with the provided alpha.
export function hexToRgba(hex: string, alpha = 0.15) {
  try {
    let h = (hex || '').trim();
    if (h.startsWith('var(') || h === '') h = '#666666';
    if (h.startsWith('#')) {
      const c = h.substring(1);
      const full = c.length === 3 ? c.split('').map((ch) => ch + ch).join('') : c;
      const bigint = parseInt(full, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (h.startsWith('rgb')) {
      return h.replace(/rgba?\(([^)]+)\)/, (m: string, inner: string) => {
        const parts = inner.split(',').map((s: string) => s.trim());
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
      });
    }
    return `rgba(102,102,102,${alpha})`;
  } catch (e) {
    return `rgba(102,102,102,${alpha})`;
  }
}

export function bucketBySeason(
  xs: number[],
  ys: number[],
  labels: string[],
  seasonOrder: readonly string[] = ['Winter', 'Spring', 'Summer', 'Autumn'],
) {
  const buckets: Record<string, { x: number[]; y: number[]; text: string[] }> = {};
  seasonOrder.forEach((s) => (buckets[s] = { x: [], y: [], text: [] }));
  const n = Math.min(xs.length, ys.length, labels.length);
  for (let i = 0; i < n; i++) {
    const dateStr = labels[i];
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) continue;
    const season = monthToSeason(d.getMonth());
    if (!buckets[season]) buckets[season] = { x: [], y: [], text: [] };
    buckets[season].x.push(xs[i]);
    buckets[season].y.push(ys[i]);
    buckets[season].text.push(dateStr);
  }
  return buckets as Record<string, { x: number[]; y: number[]; text: string[] }>;
}