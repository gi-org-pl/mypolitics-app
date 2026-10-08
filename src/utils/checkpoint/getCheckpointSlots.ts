import type {
  CheckpointCandidate,
  CheckpointPoolId,
  CheckpointSlots,
} from "@/types/checkpoint";
import { safely } from "@/utils/function/safely";

import { getCardPoolIds } from "./getCardPoolIds";
import { readSlotValues } from "./readSlotValues";

// The values of that pool's slots, taken from the card: names exactly as the
// quiz wrote them, trimmed, and the thesis without its one closing full stop.
// A pool without slots gives no values. Nothing when the card and the pool do
// not belong together, or when a value is missing or out of range - such a
// line cannot be finished, so the card is not shown. A card that cannot be
// read at all is a card with a value missing.
export const getCheckpointSlots = (
  card: CheckpointCandidate,
  pool: CheckpointPoolId,
): CheckpointSlots | undefined =>
  safely(() => {
    if (!getCardPoolIds(card).includes(pool)) return undefined;

    const values = readSlotValues(card, pool);

    return Object.values(values).every((value) => value !== undefined)
      ? (values as CheckpointSlots)
      : undefined;
  }, undefined);
