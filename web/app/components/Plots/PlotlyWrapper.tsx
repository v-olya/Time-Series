'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { PlotParams } from 'react-plotly.js';
import { registerGraphDiv, unregisterGraphDiv } from '../../lib/plotlyManager';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = Partial<PlotParams> & {
  // allow users to receive initialized callback if they need it
  onInitialized?: (figure: unknown, graphDiv: Readonly<HTMLElement>) => void;
};

export default function PlotlyWrapper({ onInitialized: userOnInitialized, ...plotProps }: Props) {
  const graphDivRef = useRef<HTMLElement | null>(null);

  const handleInitialized = (figure: unknown, graphDiv: Readonly<HTMLElement>) => {
    graphDivRef.current = graphDiv as HTMLElement;
    registerGraphDiv(graphDiv as HTMLElement);
    if (userOnInitialized) userOnInitialized(figure, graphDiv);
  };

  useEffect(() => {
    return () => {
      const gd = graphDivRef.current;
      if (!gd) return;
      // Only unregister; global purger handles actual cleanup at navigation start
      unregisterGraphDiv(gd);
      graphDivRef.current = null;
    };
  }, []);

  return <Plot {...(plotProps as PlotParams)} onInitialized={handleInitialized} />;
}
