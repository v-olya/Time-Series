'use client';

import { useEffect } from 'react';
import { purgeAllPlotly, hasRegistered } from '../../lib/plotlyManager';

const isInternalAnchor = (el: Element | null): el is HTMLAnchorElement => {
  if (!el || !(el instanceof HTMLAnchorElement)) return false;
  if (el.target === '_blank') return false;
  const href = el.getAttribute('href') ?? '';
  if (!href) return false;
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
};

export default function PlotlyPurger(): null {
  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      // if (!hasRegistered()) return; -- it might be registered after navigation click happens
      const target = ev.target as Element | null;
      const anchor = target?.closest?.('a') ?? null;
      if (isInternalAnchor(anchor)) {
        purgeAllPlotly();
      }
    };

    const onPop = () => {
      if (hasRegistered()) purgeAllPlotly();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPop);
    window.addEventListener('beforeunload', onPop);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('beforeunload', onPop);
    };
  }, []);

  return null;
}
