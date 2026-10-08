import type { CheckpointCard } from "@/types/checkpoint";

import { getCardPoolId } from "./getCardPoolId";
import { getCardPoolIds } from "./getCardPoolIds";
import { getCheckpointSlots } from "./getCheckpointSlots";
import { storedCardSchema } from "./storedCardSchema";

// Whether a card that came back from storage can be used again as the card
// its type says it is. It has to have the shape of its variant; its line has
// to come from its own pool; and the slots of every pool it can draw from
// have to be filled - as when it fired, so a card that is up after a reload
// has its words and can finish its reveal. A value that is no card at all is
// not usable.
export const isUsableCard = (card: CheckpointCard): boolean =>
  storedCardSchema.safeParse(card).success &&
  getCardPoolId(card) === card.line.pool &&
  getCardPoolIds(card).every(
    (pool) => getCheckpointSlots(card, pool) !== undefined,
  );
