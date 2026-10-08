import type { CheckpointCard } from "@/types/checkpoint";
import { safely } from "@/utils/function/safely";
import { isCount } from "@/utils/number/isCount";
import { isNumber } from "@/utils/number/isNumber";

import { getCardPoolId } from "./getCardPoolId";
import { getCardPoolIds } from "./getCardPoolIds";
import { getCheckpointSlots } from "./getCheckpointSlots";

// Whether a card that came back from storage can be used again as the card
// its type says it is. Its line has to come from its own pool, the slots of
// every pool it can draw from have to be filled - as when it fired, so a card
// that is up after a reload has its words and can finish its reveal - and it
// has to hold the values of its variant that the engine reads back from the
// record and that its card draws. An orientation is taken as one when it has
// an identifier: its shape is not defined a second time here. A card that
// cannot be read at all is not usable.
export const isUsableCard = (card: CheckpointCard): boolean =>
  safely(() => {
    const hasWords =
      getCardPoolId(card) === card.line.pool &&
      getCardPoolIds(card).every(
        (pool) => getCheckpointSlots(card, pool) !== undefined,
      );

    if (!hasWords) return false;

    switch (card.type) {
      case "stats":
        return (
          typeof card.questionId === "string" &&
          [card.counts.for, card.counts.against, card.counts.noAnswer].every(
            isCount,
          )
        );
      case "new-trait":
        return typeof card.trait.id === "string";
      case "position-puzzle":
        return (
          isNumber(card.closeness) &&
          [card.leader, ...card.options].every(
            ({ id }) => typeof id === "string",
          )
        );
      case "nolan-path":
        return card.trail.every(({ x, y, done }) =>
          [x, y, done].every(isNumber),
        );
      case "axis-closeness":
        return (
          typeof card.axisId === "string" &&
          (card.variant === "single"
            ? [card.entry]
            : [card.start, card.end]
          ).every(({ orientation }) => typeof orientation.id === "string")
        );
      case "axis-puzzle":
        return (
          typeof card.axisId === "string" &&
          [card.start, card.end].every(
            ({ orientation }) => typeof orientation.id === "string",
          )
        );
      default:
        return isNumber(card.percent);
    }
  }, false);
