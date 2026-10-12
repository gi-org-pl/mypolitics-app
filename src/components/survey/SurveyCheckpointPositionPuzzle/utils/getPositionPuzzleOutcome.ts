import type {
  CheckpointOutcome,
  PositionPuzzleCheckpointCard,
} from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";

// What a guess comes to: a hit when the picked orientation is the archetype
// that was the closest when the card fired, a miss for any other. The card
// is read as it is - nothing is ranked again.
export const getPositionPuzzleOutcome = (
  card: PositionPuzzleCheckpointCard,
  picked: Orientation,
): CheckpointOutcome => (picked.id === card.leader.id ? "hit" : "miss");
