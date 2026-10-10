import { EMPTY_SCORE_TOTAL } from "@/constants/checkpoint";
import type { ScoreTotal } from "@/types/checkpoint";

import { addScoreTotals } from "./addScoreTotals";

// The points and the maximum of one side of an axis: the sums over its
// orientations, each counted once. An orientation without a score adds
// nothing.
export const getSideTotal = (
  scores: Readonly<Record<string, ScoreTotal>>,
  orientationIds: readonly string[],
): ScoreTotal =>
  [...new Set(orientationIds)].reduce<ScoreTotal>(
    (total, id) =>
      Object.hasOwn(scores, id) ? addScoreTotals(total, scores[id]) : total,
    EMPTY_SCORE_TOTAL,
  );
