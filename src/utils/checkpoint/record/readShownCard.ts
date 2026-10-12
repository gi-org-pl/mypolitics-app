import {
  CHECKPOINT_PRIORITY,
  CHECKPOINT_REVEAL_POOLS,
} from "@/constants/checkpoint";
import type {
  CheckpointCard,
  CheckpointOutcome,
  CheckpointShownCard,
} from "@/types/checkpoint";
import { isOneOf } from "@/utils/array/isOneOf";

import { isCheckpointLine } from "@/utils/checkpoint/lines/isCheckpointLine";
import { isUsableCard } from "./isUsableCard";

const OUTCOMES: readonly CheckpointOutcome[] = ["hit", "miss"];

// One stored item of the cards shown as a shown card, or nothing when it is
// not one. It has to hold a card with a known type and a line that exists in
// the pools, and the card has to be usable as that type - a whole-number
// boundary and every value of its variant included: a card of another shape
// would count for the pacing, could be up with no words after a reload, and
// would cost its type every later card. Of its reveal lines only those are
// kept that exist and come from the pool of that outcome of its type.
export const readShownCard = (
  stored: unknown,
): CheckpointShownCard | undefined => {
  const { card, revealLines } = (stored ?? {}) as Partial<
    Record<keyof CheckpointShownCard, unknown>
  >;
  const { type, line } = (card ?? {}) as Partial<
    Record<keyof CheckpointCard, unknown>
  >;

  if (
    !isOneOf(CHECKPOINT_PRIORITY, type) ||
    !isCheckpointLine(line) ||
    !isUsableCard(card as CheckpointCard)
  ) {
    return undefined;
  }

  const keptLines = OUTCOMES.flatMap((outcome) => {
    const revealLine = (revealLines as Record<string, unknown> | undefined)?.[
      outcome
    ];

    return isCheckpointLine(revealLine) &&
      revealLine.pool === CHECKPOINT_REVEAL_POOLS[type]?.[outcome]
      ? [[outcome, revealLine]]
      : [];
  });

  return {
    card: card as CheckpointCard,
    ...(keptLines.length > 0
      ? { revealLines: Object.fromEntries(keptLines) }
      : {}),
  };
};
