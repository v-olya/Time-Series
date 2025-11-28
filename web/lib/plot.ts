import type { ScatterData } from 'plotly.js';
import { PlotParams } from 'react-plotly.js';

export function scatterTrace(
  x: Array<string | number | Date>,
  y: Array<number | null>,
  name: string,
  opacity = 1,
): Partial<PlotParams & ScatterData> {
  return { x, y, type: 'scatter', mode: 'lines', name, opacity };
}
