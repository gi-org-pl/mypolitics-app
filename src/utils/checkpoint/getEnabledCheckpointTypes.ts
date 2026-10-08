import { CHECKPOINT_PRIORITY } from "@/constants/checkpoint";
import type {
  CheckpointCardRegistry,
  CheckpointType,
} from "@/types/checkpoint";

// The types the engine may select: those that have a card component, in
// priority order. An empty registry enables nothing, so no card ever fires.
export const getEnabledCheckpointTypes = (
  cards: CheckpointCardRegistry,
): CheckpointType[] =>
  CHECKPOINT_PRIORITY.filter((type) => cards[type] !== undefined);
