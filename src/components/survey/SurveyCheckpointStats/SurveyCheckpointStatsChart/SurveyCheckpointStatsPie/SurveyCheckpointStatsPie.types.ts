import type { StatsSlice } from "../../SurveyCheckpointStats.types";

export interface SurveyCheckpointStatsPieProps {
  slices: StatsSlice[]; // in the order they are drawn, together the whole circle
  description: string; // the pie in words: its accessible name
}
