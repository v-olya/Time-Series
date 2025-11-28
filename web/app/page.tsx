import fs from 'fs';
import path from 'path';
import Teaser from '../components/Teaser';
import TeaserGroup from '../components/TeaserGroup';
import PriceLegend from '../components/PriceLegend';
import type { ProcessedData, SeriesMap, TimePoint } from '../lib/types/processed';

export default function HomePage() {
  const readJson = (name: string): ProcessedData | null => {
    const filePath = path.join(process.cwd(), 'public', 'data', 'processed', name);
    try {
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw) as ProcessedData;
    } catch (e) {
      return null;
    }
  };

  const dairy = readJson('dairy_eda.json');
  const flour = readJson('flour_eda.json');
  const eggs = readJson('eggs_eda.json');

  const dairySeries = (dairy?.series ?? {}) as SeriesMap;
  // Use end-consumer price series (S-columns)
  const milkKey = 'S  mléko polotučné pasterované [l]_timeseries';
  const butterKey = 'S  máslo [kg]_timeseries';
  const edamKey = 'S  eidamská cihla [kg]_timeseries';

  const milkData: ProcessedData = {
    timeSeries: (dairySeries[milkKey] || []) as TimePoint[],
    meta: { series: milkKey, category: 'dairy' },
  };

  const butterData: ProcessedData = {
    timeSeries: (dairySeries[butterKey] || []) as TimePoint[],
    meta: { series: butterKey, category: 'dairy' },
  };

  const edamData: ProcessedData = {
    timeSeries: (dairySeries[edamKey] || []) as TimePoint[],
    meta: { series: edamKey, category: 'dairy' },
  };

  const flourSeries = (flour?.series ?? {}) as SeriesMap;
  const flourKeyS = 'S  pšeničná mouka hladká [kg]_timeseries';
  const flourDataS: ProcessedData = {
    timeSeries: (flourSeries[flourKeyS] || []) as TimePoint[],
    meta: { series: flourKeyS, category: 'flour' },
  };

  // Eggs teasers
  const eggsSeries = (eggs?.series ?? {}) as SeriesMap;
  const eggsKeyS = 'S  vejce slepičí čerstvá [ks]_timeseries';
  const eggsDataS: ProcessedData = {
    timeSeries: (eggsSeries[eggsKeyS] || []) as TimePoint[],
    meta: { series: eggsKeyS, category: 'eggs' },
  };

  return (
    <div className="container">
      <div className="heading txt-c">
        <h1>Real-life time series analysis and forecasting</h1>
        <h2 className="subheading">Product prices in &nbsp;2013 &ndash; 2025</h2>
        <h3>Data source:{' '}
          <a 
            className="blue-link" 
            href="https://data.gov.cz/dataset?iri=https%3A%2F%2Fdata.gov.cz%2Fzdroj%2Fdatov%C3%A9-sady%2F00025593%2F02f3decfbfdabecebd4c0548f55390a0"
            target="_blank" rel="noopener noreferrer">
                Czech Data Portal
          </a>
        </h3>
      </div>
      <PriceLegend />
      <TeaserGroup
        heading="Dairy products"
        teasers={[
          { title: 'Index', href: '/dairy', series: dairy },
          { title: 'Milk, semi-skimmed', href: '/dairy', series: milkData },
          { title: 'Butter', href: '/dairy', series: butterData },
          { title: 'Edam cheese', href: '/dairy', series: edamData },
        ]}
        fallback="No dairy data available"
      />

      <TeaserGroup
        heading="Wheat flour"
        teasers={[
          { title: 'Index', href: '/flour', series: flour },
          { title: 'Plain flour', href: '/flour', series: flourDataS },
        ]}
        fallback="No flour data available"
      />

      <TeaserGroup
        heading="Eggs"
        teasers={[
          { title: 'Index', href: '/eggs', series: eggs },
          { title: 'Chicken egg', href: '/eggs', series: eggsDataS },
        ]}
        fallback="No eggs data available"
      />
    </div>
  );
}
