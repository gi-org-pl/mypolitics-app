import type { StatsSliceId } from "../../../SurveyCheckpointStats.types";

export interface SurveyCheckpointStatsLegendRowProps {
  id: StatsSliceId; // the slice the row stands for: it decides the colour of the dot
  name: string; // translated
}
