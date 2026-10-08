import type { SurveyAxis } from "@/types/survey";

import { toKnownOrientationIds } from "./toKnownOrientationIds";

// The axis as the quiz has it: a reference to an orientation the quiz does
// not have is dropped, and an orientation is on a side once.
export const toKnownAxis = (
  axis: SurveyAxis,
  orientationIds: ReadonlySet<string>,
): SurveyAxis => ({
  ...axis,
  negativeOrientationIds: toKnownOrientationIds(
    axis.negativeOrientationIds,
    orientationIds,
  ),
  positiveOrientationIds: toKnownOrientationIds(
    axis.positiveOrientationIds,
    orientationIds,
  ),
});
