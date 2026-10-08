import {
  POSITION_PUZZLE_MIN_ARCHETYPES,
  POSITION_PUZZLE_MIN_SEPARATION,
} from "@/constants/checkpoint";
import { PARTIAL_MATCH_FROM } from "@/constants/results";
import type {
  CheckpointCandidate,
  CheckpointTriggerInput,
} from "@/types/checkpoint";
import { isNumber } from "@/utils/number/isNumber";

import { getPositionPuzzleOptions } from "./getPositionPuzzleOptions";
import { getShownCards } from "./getShownCards";

// The position puzzle, once per session: the quiz has at least 3 archetypes,
// at least half the questions are done, and the closest archetype is clearly
// the closest - its closeness is 50 or more, the least the results name
// anybody at, and at least 5 points above the runner-up's. All of it is
// compared on the exact values. A leader or a runner-up without a closeness
// gives no separation to measure, so no card; neither does a quiz that
// cannot supply two distractors.
export const getPositionPuzzleCandidate = ({
  state,
  record,
  seed,
}: CheckpointTriggerInput):
  | Extract<CheckpointCandidate, { type: "position-puzzle" }>
  | undefined => {
  const { archetypes, progress } = state;
  const [leader, runnerUp] = archetypes;

  if (
    archetypes.length < POSITION_PUZZLE_MIN_ARCHETYPES ||
    progress.done < progress.midpointBoundary ||
    getShownCards(record.cardsShown, "position-puzzle").length > 0 ||
    !isNumber(leader.value) ||
    !isNumber(runnerUp.value) ||
    leader.value < PARTIAL_MATCH_FROM ||
    leader.value - runnerUp.value < POSITION_PUZZLE_MIN_SEPARATION
  ) {
    return undefined;
  }

  const options = getPositionPuzzleOptions(archetypes, seed);

  return options
    ? {
        type: "position-puzzle",
        boundary: progress.done,
        leader: leader.orientation,
        closeness: leader.value,
        options,
      }
    : undefined;
};
