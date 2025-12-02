'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  children: ReactNode;
  height?: number;
  // Distance from viewport to start loading
  rootMargin?: string;
};

// Lazy-loads plot components only when they scroll into view.
export function LazyPlot({ children, height = 200, rootMargin = '500px' }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={containerRef} style={{ minHeight: height }}>
      {isVisible ? (
        children
      ) : (
        <div className="lazy-plot-skeleton" />
      )}
    </div>
  );
}
