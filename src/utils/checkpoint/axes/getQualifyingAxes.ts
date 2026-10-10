import { AXIS_CARD_MIN_ANSWERED } from "@/constants/checkpoint";
import type {
  CheckpointShownCard,
  LeaningAxis,
  RunningAxis,
} from "@/types/checkpoint";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { getShownCards } from "@/utils/checkpoint/record/getShownCards";
import { getAxisOrientationKey } from "./getAxisOrientationKey";
import { isLeaningAxis } from "./isLeaningAxis";

// The axes a card may speak about at this boundary, the best first: at least
// 5 answered questions feed the axis, it leans clearly, and it has had no
// card - neither a closeness card nor a puzzle carries its identifier or its
// orientations. Two axes with the same orientations are one axis here, and
// the earlier one in the quiz stands for both. The order is the clearest lean,
// then more answered questions behind it, then the quiz's order.
export const getQualifyingAxes = (
  axes: readonly RunningAxis[],
  cardsShown: readonly CheckpointShownCard[],
): LeaningAxis[] => {
  const axisCards = [
    ...getShownCards(cardsShown, "axis-closeness"),
    ...getShownCards(cardsShown, "axis-puzzle"),
  ];
  const usedIds = new Set(axisCards.map(({ axisId }) => axisId));
  const usedKeys = new Set(axisCards.map(getAxisOrientationKey));

  return uniqueBy(
    axes
      .filter(isLeaningAxis)
      .filter(
        (axis) =>
          axis.answered >= AXIS_CARD_MIN_ANSWERED &&
          !usedIds.has(axis.id) &&
          !usedKeys.has(getAxisOrientationKey(axis)),
      ),
    getAxisOrientationKey,
  ).sort(
    (first, second) =>
      second.lean - first.lean || second.answered - first.answered,
  );
};
