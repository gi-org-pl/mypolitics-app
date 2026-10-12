import type { StatsSliceId } from "./SurveyCheckpointStats.types";

// The order of the three slices: in the pie, in the legend and in the
// description.
export const STATS_SLICE_IDS: readonly StatsSliceId[] = [
  "for",
  "against",
  "noAnswer",
];

// The smallest share of the circle a slice is drawn at: a count above zero is
// always seen, however small a part of the whole it is.
export const MIN_SLICE_SHARE = 0.03;

// The colour of each slice and of its dot in the legend. Both are drawn in
// the current colour, so the two can never differ.
export const STATS_SLICE_COLOR_CLASS_NAMES: Record<StatsSliceId, string> = {
  for: "text-emerald-600",
  against: "text-red-400",
  noAnswer: "text-gi-ash",
};

// The quotation marks a line may put around the thesis, in any language.
export const QUOTATION_MARKS: readonly string[] = [
  "„",
  "”",
  "“",
  '"',
  "«",
  "»",
  "‚",
  "‘",
  "’",
  "'",
];
