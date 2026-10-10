import { CHECKPOINT_REVEAL_POOLS } from "@/constants/checkpoint";
import type { CheckpointCandidate, CheckpointPoolId } from "@/types/checkpoint";

import { getCardPoolId } from "./getCardPoolId";

// Every pool a card can draw from: its own, and for a puzzle the pools of its
// two reveals.
export const getCardPoolIds = (
  card: CheckpointCandidate,
): CheckpointPoolId[] => [
  getCardPoolId(card),
  ...Object.values(CHECKPOINT_REVEAL_POOLS[card.type] ?? {}),
];
