import type { ResolutionContext, ResultEntry } from "@/types/results";
import { getShownOrientations } from "@/utils/result-modules/orientations/getShownOrientations";
import { getSideValue } from "@/utils/running-state/scores/getSideValue";

// One side of an axis as a module draws it: the first shown orientation of
// the side, with the side's value. The value counts every orientation of the
// side, the hidden ones too. A side with no shown orientation is no side.
export const toAxisSideEntry = (
  orientationIds: readonly string[],
  context: Pick<ResolutionContext, "survey" | "result" | "gender">,
): ResultEntry | undefined => {
  const [orientation] = getShownOrientations(orientationIds, context);

  return (
    orientation && {
      orientation,
      value: getSideValue(context.result.scores, orientationIds),
    }
  );
};
