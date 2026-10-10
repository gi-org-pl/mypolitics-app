import {
  CHECKPOINT_POOLS,
  CHECKPOINT_REVEAL_POOLS,
} from "@/constants/checkpoint";
import type {
  CheckpointLine,
  CheckpointOutcome,
  CheckpointPools,
  CheckpointRecord,
} from "@/types/checkpoint";

import { drawCheckpointLine } from "./drawCheckpointLine";

// The reveal line of the card that is up - the last of the cards shown - for
// a guess that hit or missed: the line already recorded for that outcome, or
// a newly drawn one from that state's own pool, recorded in the returned
// record. A guess repeated after a reload therefore reads the same words and
// draws nothing. No line for a card that is not a puzzle, or with no card up.
// The returned record is what the screen writes back to the session.
export const drawRevealLine = (
  record: CheckpointRecord,
  outcome: CheckpointOutcome,
  seed: string,
  pools: CheckpointPools = CHECKPOINT_POOLS,
): { line?: CheckpointLine; record: CheckpointRecord } => {
  const shownCard = record.cardsShown.at(-1);
  const pool =
    shownCard && CHECKPOINT_REVEAL_POOLS[shownCard.card.type]?.[outcome];

  if (!shownCard || !pool) return { record };

  const recordedLine = shownCard.revealLines?.[outcome];

  if (recordedLine) return { line: recordedLine, record };

  const line = drawCheckpointLine(pool, record, seed, pools);

  return line
    ? {
        line,
        record: {
          ...record,
          cardsShown: [
            ...record.cardsShown.slice(0, -1),
            {
              ...shownCard,
              revealLines: { ...shownCard.revealLines, [outcome]: line },
            },
          ],
        },
      }
    : { record };
};
