import Teaser from './Teaser';
import type { ProcessedData } from '../../lib/types/types';

type TeaserItem = {
  title: string;
  href: string;
  series: ProcessedData | null;
};

type Props = {
  heading: string;
  teasers: TeaserItem[];
  fallback?: string;
};

export default function TeaserGroup({ heading, teasers, fallback }: Props) {
  const hasIndex = teasers && teasers.length && teasers[0].series;

  return (
    <div className="group">
      <h3>{heading}</h3>
      <div className="cards-grid">
        {hasIndex ? (
          teasers.map((t, i) => (
            <Teaser
              key={i}
              title={t.title}
              href={t.href}
              series={
                t.series || ({ timeSeries: [], meta: { series: '', category: heading.toLowerCase() } } as ProcessedData)
              }
              showFullAnalysis={i === 0}
            />
          ))
        ) : (
          <div>{fallback ?? `No ${heading.toLowerCase()} data available`}</div>
        )}
      </div>
    </div>
  );
}
