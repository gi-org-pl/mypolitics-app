import type { ScoreTotal } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import type { ResultEntry } from "@/types/results";
import { getSideValue } from "@/utils/running-state/scores/getSideValue";

// An orientation with its value: its points as a share of its maximum. The
// value is absent when the orientation has no score or its maximum is zero.
export const toResultEntry = (
  orientation: Orientation,
  scores: Readonly<Record<string, ScoreTotal>>,
): ResultEntry => ({
  orientation,
  value: getSideValue(scores, [orientation.id]),
});
