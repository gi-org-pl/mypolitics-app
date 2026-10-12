import type { StatsCheckpointCard } from "@/types/checkpoint";

import type { StatsSliceNames } from "../SurveyCheckpointStats.types";

export interface SurveyCheckpointStatsChartProps {
  counts: StatsCheckpointCard["counts"]; // the three totals the slices are sized by
  description: string; // the pie in words, translated
  names: StatsSliceNames; // the names of the legend rows, translated
}
