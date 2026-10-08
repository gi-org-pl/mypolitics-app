import { AXIS_TYPE } from "@/constants/checkpoint";
import type { Orientation, QuizOrientation } from "@/types/orientation";
import type { SurveyAxis } from "@/types/survey";
import { findOrientation } from "@/utils/orientation/findOrientation";

import { toNamedOrientation } from "./toNamedOrientation";

// The orientation at each end of an axis a card can speak about: the negative
// side is the start, the positive side the end, and a side may be empty.
// There is nothing for an axis of another type, with more than one
// orientation on a side, with the same orientation on both sides, or with an
// orientation that is hidden or has no name. The axis is taken as the quiz
// has it - see `toKnownAxis`.
export const getAxisPoles = (
  axis: SurveyAxis,
  orientations: QuizOrientation[],
): { start?: Orientation; end?: Orientation } | null => {
  const { negativeOrientationIds, positiveOrientationIds } = axis;
  const ids = [...negativeOrientationIds, ...positiveOrientationIds];

  if (
    axis.type !== AXIS_TYPE ||
    negativeOrientationIds.length > 1 ||
    positiveOrientationIds.length > 1 ||
    new Set(ids).size !== ids.length
  ) {
    return null;
  }

  const poles = ids.map((id) =>
    toNamedOrientation(findOrientation(orientations, id)),
  );

  if (poles.includes(undefined)) return null;

  return {
    start: negativeOrientationIds.length > 0 ? poles.at(0) : undefined,
    end: positiveOrientationIds.length > 0 ? poles.at(-1) : undefined,
  };
};
