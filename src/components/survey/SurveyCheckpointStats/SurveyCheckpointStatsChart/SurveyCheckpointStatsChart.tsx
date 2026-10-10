import type { SurveyCheckpointStatsChartProps } from "./SurveyCheckpointStatsChart.types";
import { SurveyCheckpointStatsLegend } from "./SurveyCheckpointStatsLegend/SurveyCheckpointStatsLegend";
import { SurveyCheckpointStatsPie } from "./SurveyCheckpointStatsPie/SurveyCheckpointStatsPie";
import { getPieSlices } from "./utils/getPieSlices";

// The visual of the stats chart card: the pie and, beside it, its legend,
// centred in the width it is given. Where the two do not fit side by side the
// legend moves under the pie, and its names are never cut. Nothing is drawn
// when the counts give no slice.
export const SurveyCheckpointStatsChart = ({
  counts,
  description,
  names,
}: SurveyCheckpointStatsChartProps) => {
  const slices = getPieSlices(counts);

  if (slices.length === 0) return null;

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-x-6 gap-y-4">
      <SurveyCheckpointStatsPie slices={slices} description={description} />
      <SurveyCheckpointStatsLegend names={names} />
    </div>
  );
};
