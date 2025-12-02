'use client';
import Link from 'next/link';
import PlotlyWrapper from '../Plots/PlotlyWrapper';
import styles from './Teaser.module.css';
import type { ProcessedData, TimePoint } from '../../lib/types';
import { scatterTrace } from '../../lib/plotlyUtils';

type Props = {
  title: string;
  href: string;
  series: ProcessedData;
  windowMonths?: number;
  showFullAnalysis?: boolean;
};

export function Teaser({ title, href, series, windowMonths = 36, showFullAnalysis = false }: Props) {
  const last = series.timeSeries[series.timeSeries.length - 1] as TimePoint | undefined;
  const sparkSlice = series.timeSeries.slice(-windowMonths) as TimePoint[];
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
      <div className={styles.headerRow}>
        {(() => {
          const isComposite = title === 'Index';
          return (
            <h4 className={`${styles.title} ${isComposite ? styles.composite : styles.product}`}>
              {title}
            </h4>
          );
        })()}
        {showFullAnalysis && (
          <div className={styles.linkWrap}>
            <Link href={href} className="blue-link">Full analysis →</Link>
          </div>
        )}
      </div>

      <div className={styles.latest}>
        Latest: <strong>{last?.value?.toFixed ? last.value.toFixed(2) : last?.value}</strong> (
        {last?.date})
      </div>

      <div className={styles.plot}>
        <PlotlyWrapper
          data={[scatterTrace(sparkX, sparkY, '', 1)]}
          layout={{
            height: 100,
            margin: { t: 8, b: 28, l: 36, r: 8 },
            autosize: true,
            xaxis: {
              type: 'date',
              range: [firstX, endRange],
              tickformat: '%b %Y',
              nticks: 4,
            },
            yaxis: { automargin: true, zeroline: false },
          }}
          useResizeHandler
          className={styles.plot}
          config={{ displayModeBar: false, responsive: true }}
        />
      </div>

      {/* link moved into headerRow to align with title */}
    </div>
  );
}
