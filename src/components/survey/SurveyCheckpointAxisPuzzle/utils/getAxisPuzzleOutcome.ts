import type {
  AxisPuzzleCheckpointCard,
  CheckpointOutcome,
} from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";

// What a guess comes to: a hit when the picked orientation is the pole that
// led when the card fired, a miss for any other. The card is read as it is -
// nothing is counted again.
export const getAxisPuzzleOutcome = (
  card: AxisPuzzleCheckpointCard,
  picked: Orientation,
): CheckpointOutcome =>
  picked.id === card[card.leadingSide].orientation.id ? "hit" : "miss";
