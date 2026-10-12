import { CHECKPOINT_PRIORITY } from "@/constants/checkpoint";
import type {
  CheckpointCandidate,
  CheckpointCard,
  CheckpointEngineInput,
  CheckpointTriggerInput,
  CheckpointType,
} from "@/types/checkpoint";
import { getAxisClosenessCandidate } from "@/utils/checkpoint/candidates/getAxisClosenessCandidate";
import { getAxisPuzzleCandidate } from "@/utils/checkpoint/candidates/getAxisPuzzleCandidate";
import { getHalfwayCandidate } from "@/utils/checkpoint/candidates/getHalfwayCandidate";
import { getNewTraitCandidate } from "@/utils/checkpoint/candidates/getNewTraitCandidate";
import { getNolanPathCandidate } from "@/utils/checkpoint/candidates/getNolanPathCandidate";
import { getPositionPuzzleCandidate } from "@/utils/checkpoint/candidates/getPositionPuzzleCandidate";
import { getStatsCandidate } from "@/utils/checkpoint/candidates/getStatsCandidate";
import { safely } from "@/utils/function/safely";
import { isCheckpointSlotOpen } from "./isCheckpointSlotOpen";
import { rankCheckpointCandidates } from "./rankCheckpointCandidates";
import { toCheckpointCard } from "./toCheckpointCard";

// The trigger and the gate of every card type.
const CANDIDATES: Record<
  CheckpointType,
  (input: CheckpointTriggerInput) => CheckpointCandidate | undefined
> = {
  stats: getStatsCandidate,
  "new-trait": getNewTraitCandidate,
  "position-puzzle": getPositionPuzzleCandidate,
  "nolan-path": getNolanPathCandidate,
  "axis-closeness": getAxisClosenessCandidate,
  "axis-puzzle": getAxisPuzzleCandidate,
  halfway: getHalfwayCandidate,
};

// Which card, if any, appears at this boundary: one card or nothing, at once.
// The steps, in order: the opt-out; the slot - the pacing rules that do not
// depend on the card; the trigger and the gate of every enabled type; the
// words - a candidate that cannot be put into words is not a candidate; the
// selection; and the last pacing rule, no two cards of one type in a row.
//
// Nothing is queued and nothing is remembered: the record of the cards shown
// is the only memory, and the caller keeps it. A standing trigger that lost
// is simply true again at the next boundary; a moment that lost is gone.
// There is no clock and no chance here, apart from the seeded draw, so the
// same input always gives the same card with the same values and line.
//
// Never throws. A type that fails costs the boundary only its own card, and
// any other failure is "nothing".
export const getNextCheckpoint = (
  input: CheckpointEngineInput,
): CheckpointCard | null =>
  safely(() => {
    const { state, record, seed, isOptedOut, enabledTypes } = input;

    if (
      isOptedOut ||
      !state ||
      !isCheckpointSlotOpen(state.progress, record.cardsShown)
    ) {
      return null;
    }

    const cards = CHECKPOINT_PRIORITY.filter((type) =>
      enabledTypes.includes(type),
    ).flatMap((type) => {
      const card = safely(() => {
        const candidate = CANDIDATES[type]({ ...input, state });

        return candidate && toCheckpointCard(candidate, record, seed);
      }, undefined);

      return card ?? [];
    });
    const [winner] = rankCheckpointCandidates(cards, record.cardsShown);

    return winner ?? null;
  }, null);
