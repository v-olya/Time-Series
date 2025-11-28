import type { ScatterData } from 'plotly.js';

export function scatterTrace(
  x: Array<string | number | Date>,
  y: Array<number | null>,
  name: string,
  opacity: number,
): Partial<ScatterData> {
  return { x, y, type: 'scatter', mode: 'lines', name, opacity };
}
