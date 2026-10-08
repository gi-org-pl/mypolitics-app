import { CHECKPOINT_PRIORITY } from "@/constants/checkpoint";
import type {
  CheckpointCard,
  CheckpointOutcome,
  CheckpointShownCard,
} from "@/types/checkpoint";
import { isOneOf } from "@/utils/array/isOneOf";

import { isCheckpointLine } from "./isCheckpointLine";

const OUTCOMES: readonly CheckpointOutcome[] = ["hit", "miss"];

// One stored item of the cards shown as a shown card, or nothing when it is
// not one: it has to hold a card with a known type, a whole-number boundary
// and a line that exists in the pools. Of its reveal lines only those that
// exist are kept.
export const readShownCard = (
  stored: unknown,
): CheckpointShownCard | undefined => {
  const { card, revealLines } = (stored ?? {}) as Partial<
    Record<keyof CheckpointShownCard, unknown>
  >;
  const { type, boundary, line } = (card ?? {}) as Partial<
    Record<keyof CheckpointCard, unknown>
  >;

  if (
    !isOneOf(CHECKPOINT_PRIORITY, type) ||
    !Number.isInteger(boundary) ||
    !isCheckpointLine(line)
  ) {
    return undefined;
  }

  const keptLines = OUTCOMES.flatMap((outcome) => {
    const revealLine = (revealLines as Record<string, unknown> | undefined)?.[
      outcome
    ];

    return isCheckpointLine(revealLine) ? [[outcome, revealLine]] : [];
  });

  return {
    card: card as CheckpointCard,
    ...(keptLines.length > 0
      ? { revealLines: Object.fromEntries(keptLines) }
      : {}),
  };
};
