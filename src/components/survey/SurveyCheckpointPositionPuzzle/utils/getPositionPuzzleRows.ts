import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";

// The rows the card offers: its options in the order the engine drew them,
// each without its colour. The card shows no archetype's own colour, so the
// image of a row sits on the neutral colour of the row. The card it is given
// is left as it was.
export const getPositionPuzzleRows = (
  card: PositionPuzzleCheckpointCard,
): Orientation[] => card.options.map(({ color: _color, ...row }) => row);
