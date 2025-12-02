import fs from 'fs';
import path from 'path';
import type { ProcessedData } from '../lib/types';
import { mergeForecastsIntoData } from '../lib/loadPrecomputedForecasts';
import { LazyPlot } from '../components/Plots/LazyPlot';
import { FlourAcrossChannels } from '../components/FlourAcrossChannels';
import { FlourScatter } from '../components/FlourScatter';
import { FlourRadar } from '../components/FlourRadar';
import { FlourHeatmap } from '../components/FlourHeatmap';
import { FlourWaterfall } from '../components/FlourWaterfall';
import { FlourFunnel } from '../components/FlourFunnel';

export default function FlourPage() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'processed', 'flour_eda.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as ProcessedData;
  mergeForecastsIntoData(data, 'flour');

  return (
    <>
      {/* First plot loads immediately for fast FCP */}
      <FlourAcrossChannels data={data} height={600} />

      <LazyPlot height={480}>
        <div className="plot-container two-plots">
          <div className="inner-large">
            <FlourScatter data={data} height={480} />
          </div>
          <div className="inner-small">
            <FlourRadar data={data} height={480} />
          </div>
        </div>
      </LazyPlot>

      <LazyPlot height={700}>
        <FlourHeatmap data={data} height={700} />
      </LazyPlot>

      <LazyPlot height={480}>
        <div className="plot-container two-plots">
          <div className="inner-large">
            <FlourWaterfall data={data} height={480} />
          </div>
          <div className="inner-small">
            <FlourFunnel data={data} height={480} />
          </div>
        </div>
      </LazyPlot>
    </>
  );
}
