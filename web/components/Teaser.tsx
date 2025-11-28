import Link from 'next/link';
import dynamic from 'next/dynamic';
import React from 'react';
import styles from './Teaser.module.css';
import type { ProcessedData, TimePoint } from '../lib/types/processed';
import { scatterTrace } from '../lib/plot';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

type Props = {
  title: string;
  href: string;
  series: ProcessedData;
  windowMonths?: number;
};

export default function Teaser({ title, href, series, windowMonths = 36 }: Props) {
  const last = series.observed[series.observed.length - 1] as TimePoint | undefined;
  const sparkSlice = series.observed.slice(-windowMonths) as TimePoint[];
  const sparkX = sparkSlice.map((d) => d.date);
  const sparkY = sparkSlice.map((d) => d.value);

  const firstX = sparkX[0];
  const lastX = sparkX[sparkX.length - 1];
  let endRange: string | Date = lastX;
  try {
    const tmp = new Date(lastX);
    tmp.setDate(tmp.getDate() + 1);
    endRange = tmp.toISOString();
  } catch (e) {
    endRange = lastX;
  }

  return (
    <div className={styles.teaser}>
      <h4 className={styles.title}>{title}</h4>
      <div className={styles.latest}>
        Latest: <strong>{last?.value?.toFixed ? last.value.toFixed(2) : last?.value}</strong> (
        {last?.date})
      </div>

      <div className={styles.plot}>
        <Plot
          data={[scatterTrace(sparkX, sparkY, undefined, undefined)]}
          layout={{
            height: 100,
            margin: { t: 8, b: 28, l: 36, r: 8 },
            autosize: true,
            xaxis: { type: 'date', range: [firstX, endRange], tickformat: '%b %Y', nticks: 4 },
            yaxis: { automargin: true, zeroline: false },
          }}
          useResizeHandler
          className={styles.plot}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>

      <div className={styles.linkWrap}>
        <Link href={href}>Open {title}</Link>
      </div>
    </div>
  );
}
