import type { ResultOrientationResponse } from "@/services/api/schemas/result";
import type { ScoreTotal } from "@/types/checkpoint";

// The points and the maximum of one orientation of a result. Neither is ever
// below zero: a negative number reads as 0.
export const toScoreTotal = ({
  points,
  maxPossible,
}: ResultOrientationResponse): ScoreTotal => ({
  points: Math.max(0, points),
  maximum: Math.max(0, maxPossible),
});
