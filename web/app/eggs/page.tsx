import { getProcessedData } from '../lib/dataLoader';
import { LazyPlot } from '../components/Plots/LazyPlot';
import { EggsAcrossChannels } from '../components/EggsAcrossChannels';
import { EggsScatter } from '../components/EggsScatter';
import { EggsRadar } from '../components/EggsRadar';
import { EggsHeatmap } from '../components/EggsHeatmap';
import { EggsWaterfall } from '../components/EggsWaterfall';

export default async function EggsPage() {
  const data = await getProcessedData('eggs');

  return (
    <>
      <EggsAcrossChannels data={data} height={600} />

      <LazyPlot height={480}>
        <div className="plot-wrapper two-plots">
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
        <div className="plot-wrapper single-plot">
          <EggsWaterfall data={data} height={480} />
        </div>
      </LazyPlot>
    </>
  );
}