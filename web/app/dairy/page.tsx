import fs from 'fs';
import path from 'path';
import type { ProcessedData } from '../lib/types';
import { mergeForecastsIntoData } from '../lib/loadForecasts.server';
import { DairyAcrossChannels } from '../components/DairyAcrossChannels';
import { MilkOnlyAcrossChannels } from '../components/MilkOnlyAcrossChannels';
import { DairyHeatmap}  from '../components/DairyHeatmap';
import { MilkOnlyFunnel} from '../components/MilkOnlyFunnel';
import { DairyWaterfall } from '../components/DairyWaterfall';
import { DairyScatter } from '../components/DairyScatter';
import { DairyRadar } from '../components/DairyRadar';

export default function DairyPage() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'processed', 'dairy_eda.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as ProcessedData;
  mergeForecastsIntoData(data, 'dairy');

  return <>
    <MilkOnlyAcrossChannels data={data} height={600} />
    <div className="plot-container two-plots">
      <div className="inner-large">
        <DairyScatter data={data} height={480} />
      </div>
      <div className="inner-small">
        <DairyRadar data={data} height={480} />
      </div>
    </div>
    <DairyAcrossChannels data={data} height={600} />
    <DairyHeatmap data={data} height={700} />
    <div className="plot-container two-plots">
      <div className="inner-large">
        <DairyWaterfall data={data} height={480} />
      </div>
      <div className="inner-small">
        <MilkOnlyFunnel data={data} height={480} />
      </div>
    </div>
  </>;
}
