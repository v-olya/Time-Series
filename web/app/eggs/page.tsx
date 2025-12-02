import fs from 'fs';
import path from 'path';
import type { ProcessedData } from '../lib/types';
import { mergeForecastsIntoData } from '../lib/loadPrecomputedForecasts';
import { LazyPlot } from '../components/Plots/LazyPlot';
import { EggsAcrossChannels } from '../components/EggsAcrossChannels';
import { EggsScatter } from '../components/EggsScatter';
import { EggsRadar } from '../components/EggsRadar';
import { EggsHeatmap } from '../components/EggsHeatmap';
import { EggsWaterfall } from '../components/EggsWaterfall';

export default function EggsPage() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'processed', 'eggs_eda.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as ProcessedData;

  // Merge small forecasts JSON (written by preprocessing) if available.
  mergeForecastsIntoData(data, 'eggs');

  return (
    <>
      {/* First plot loads immediately for fast FCP */}
      <EggsAcrossChannels data={data} height={600} />

      <LazyPlot height={480}>
        <div className="plot-container two-plots">
          <div className="inner-large">
            <EggsScatter data={data} height={480} />
          </div>
          <div className="inner-small">
            <EggsRadar data={data} height={480} />
          </div>
        </div>
      </LazyPlot>

      <LazyPlot height={700}>
        <EggsHeatmap data={data} height={700} />
      </LazyPlot>

      <LazyPlot height={480}>
        <div className="plot-container single-plot">
          <EggsWaterfall data={data} height={480} />
        </div>
      </LazyPlot>
    </>
  );
}