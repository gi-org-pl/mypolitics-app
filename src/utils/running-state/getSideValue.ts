import type { ScoreTotal } from "@/types/checkpoint";

import { getScoreValue } from "./getScoreValue";
import { getSideTotal } from "./getSideTotal";

// The one value of a side of an axis: the sum of the side's points as a share
// of the sum of its maximums. Nothing while that sum is zero.
export const getSideValue = (
  scores: Readonly<Record<string, ScoreTotal>>,
  orientationIds: readonly string[],
): number | undefined => getScoreValue(getSideTotal(scores, orientationIds));
