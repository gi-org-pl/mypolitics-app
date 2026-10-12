import type { AxisPuzzleCheckpointCard } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import { safely } from "@/utils/function/safely";
import { toSingleLine } from "@/utils/text/toSingleLine";

// The two poles the card offers, in the order of the bar: the start pole
// first, the end pole second. Nothing when a pole has no name, or a name of
// only space, or when the card cannot be read: an option without a name
// cannot be guessed, so such a card is not drawn.
export const getAxisPuzzleOptions = (
  card: AxisPuzzleCheckpointCard,
): Orientation[] | undefined =>
  safely(() => {
    const options = [card.start.orientation, card.end.orientation];

    return options.every(({ name }) => toSingleLine(name) !== "")
      ? options
      : undefined;
  }, undefined);
