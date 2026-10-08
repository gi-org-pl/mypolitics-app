import type { Orientation, QuizOrientation } from "@/types/orientation";
import { toDisplayOrientation } from "@/utils/orientation/toDisplayOrientation";
import { isOrientationShown } from "@/utils/results/isOrientationShown";
import { toSingleLine } from "@/utils/text/toSingleLine";

// The orientation as a card can name it, or nothing when it is hidden or has
// no name. Mid-quiz the taker has not been asked for a gender, so a name or an
// image with two forms shows the masculine one.
export const toNamedOrientation = (
  orientation?: QuizOrientation,
): Orientation | undefined => {
  if (!orientation || !isOrientationShown(orientation)) return undefined;

  const displayOrientation = toDisplayOrientation(orientation);

  return toSingleLine(displayOrientation.name) !== ""
    ? displayOrientation
    : undefined;
};
