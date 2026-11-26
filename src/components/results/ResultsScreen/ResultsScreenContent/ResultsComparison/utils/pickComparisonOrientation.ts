import { ComparisonMode } from "@/types/comparison";
import type { Orientation } from "@/types/orientation";
import { findOrientation } from "@/utils/orientation/findOrientation";

import type {
  ComparisonContext,
  ComparisonState,
} from "../ResultsComparison.types";
import { isChoiceOpen } from "./isChoiceOpen";
import { toComparingState } from "./toComparingState";

// The taker picks an orientation: the comparison with it starts, and nothing
// is asked of the API. Only an offered orientation can be picked.
export const pickComparisonOrientation = (
  state: ComparisonState,
  orientationId: string,
  offered: Orientation[],
  context: ComparisonContext,
): ComparisonState => {
  const orientation = findOrientation(offered, orientationId);

  return isChoiceOpen(state) && orientation
    ? toComparingState(
        { mode: ComparisonMode.Orientation, orientation },
        context,
      )
    : state;
};
