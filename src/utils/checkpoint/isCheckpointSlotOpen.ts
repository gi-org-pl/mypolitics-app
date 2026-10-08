import {
  CHECKPOINT_MAX_CARDS,
  CHECKPOINT_MIN_DONE,
  CHECKPOINT_MIN_GAP,
  CHECKPOINT_MIN_LEFT,
  CHECKPOINT_RATE_PARTS,
  CHECKPOINT_RATE_QUESTIONS,
} from "@/constants/checkpoint";
import type { CheckpointShownCard, RunningProgress } from "@/types/checkpoint";

// Whether a card may appear at this boundary, by the pacing rules that do not
// depend on the card: not at the start, not before the end, a gap after the
// previous card, the rate, and the cap. The rate lets card number k in no
// earlier than boundary (k - 1) x R, where R is 10 questions, or a sixth of
// the quiz when that is more; both are compared in whole numbers, so a sixth
// of 100 questions costs no rounding error. The gap is counted from the
// furthest boundary a card was shown at, so a step back behind it opens
// nothing until the taker is 6 questions past it again.
export const isCheckpointSlotOpen = (
  progress: Pick<RunningProgress, "all" | "done" | "left">,
  cardsShown: readonly CheckpointShownCard[],
): boolean => {
  const { all, done, left } = progress;
  const earlierCards = cardsShown.length;
  const lastBoundary = Math.max(...cardsShown.map(({ card }) => card.boundary));

  return (
    done >= CHECKPOINT_MIN_DONE &&
    left >= CHECKPOINT_MIN_LEFT &&
    earlierCards < CHECKPOINT_MAX_CARDS &&
    done - lastBoundary >= CHECKPOINT_MIN_GAP &&
    done >= earlierCards * CHECKPOINT_RATE_QUESTIONS &&
    done * CHECKPOINT_RATE_PARTS >= earlierCards * all
  );
};
