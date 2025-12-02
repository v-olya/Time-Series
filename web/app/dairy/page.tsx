import { getProcessedData } from '../lib/dataLoader';
import { LazyPlot } from '../components/Plots/LazyPlot';
import { DairyAcrossChannels } from '../components/DairyAcrossChannels';
import { MilkOnlyAcrossChannels } from '../components/MilkOnlyAcrossChannels';
import { DairyHeatmap } from '../components/DairyHeatmap';
import { MilkOnlyFunnel } from '../components/MilkOnlyFunnel';
import { DairyWaterfall } from '../components/DairyWaterfall';
import { DairyScatter } from '../components/DairyScatter';
import { DairyRadar } from '../components/DairyRadar';

export default async function DairyPage() {
  const data = await getProcessedData('dairy');

  return (
    <>
      {/* First plot loads immediately for fast FCP */}
      <MilkOnlyAcrossChannels data={data} height={600} />

      <LazyPlot height={480}>
        <div className="plot-wrapper two-plots">
          <div className="inner-large">
            <DairyScatter data={data} height={480} />
          </div>
          <div className="inner-small">
            <DairyRadar data={data} height={480} />
          </div>
        </div>
      </LazyPlot>

      <LazyPlot height={600}>
        <DairyAcrossChannels data={data} height={600} />
      </LazyPlot>

      <LazyPlot height={700}>
        <DairyHeatmap data={data} height={700} />
      </LazyPlot>

      <LazyPlot height={480}>
        <div className="plot-wrapper two-plots">
          <div className="inner-large">
            <DairyWaterfall data={data} height={480} />
          </div>
          <div className="inner-small">
            <MilkOnlyFunnel data={data} height={480} />
          </div>
        </div>
      </LazyPlot>
    </>
  );
}
