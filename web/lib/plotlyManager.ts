type GraphDiv = HTMLElement;

const registry = new Set<GraphDiv>();

export const registerGraphDiv = (gd: GraphDiv | null): void => {
  if (!gd) return;
  registry.add(gd);
};

export const unregisterGraphDiv = (gd: GraphDiv | null): void => {
  if (!gd) return;
  registry.delete(gd);
};

export const purgeAllPlotly = (): void => {
  const plotlyObj = (globalThis as unknown as { Plotly?: unknown }).Plotly as
    | { purge?: (gd: HTMLDivElement) => void }
    | undefined;

  try {
    registry.forEach((gd) => {
      try {
        if (plotlyObj && typeof plotlyObj.purge === 'function') {
          (plotlyObj.purge as (gd: HTMLDivElement) => void)(gd as HTMLDivElement);
        } else {
          // fallback: remove children to stop renderers
          while (gd.firstChild) gd.removeChild(gd.firstChild);
        }
      } catch {
        // ignore
      }
    });
  } finally {
    registry.clear();
  }
};

export const hasRegistered = (): boolean => registry.size > 0;
