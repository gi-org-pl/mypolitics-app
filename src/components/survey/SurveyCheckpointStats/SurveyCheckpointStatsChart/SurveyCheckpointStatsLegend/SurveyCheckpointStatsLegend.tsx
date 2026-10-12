import { STATS_SLICE_IDS } from "../../SurveyCheckpointStats.constants";
import type { SurveyCheckpointStatsLegendProps } from "./SurveyCheckpointStatsLegend.types";
import { SurveyCheckpointStatsLegendRow } from "./SurveyCheckpointStatsLegendRow/SurveyCheckpointStatsLegendRow";

// The legend of the pie: three rows, always, in the order for, against, no
// answer - a slice that is not drawn keeps its row. It names the colours and
// says nothing else: no percentage, and no mark on the taker's side.
export const SurveyCheckpointStatsLegend = ({
  names,
}: SurveyCheckpointStatsLegendProps) => (
  <ul className="flex min-w-0 flex-col gap-2">
    {STATS_SLICE_IDS.map((id) => (
      <SurveyCheckpointStatsLegendRow key={id} id={id} name={names[id]} />
    ))}
  </ul>
);
