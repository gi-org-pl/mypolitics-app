import {
  POSITION_PUZZLE_DISTRACTOR_SOURCES,
  POSITION_PUZZLE_DISTRACTORS,
  POSITION_PUZZLE_DISTRACTORS_DRAW,
  POSITION_PUZZLE_ORDER_DRAW,
} from "@/constants/checkpoint";
import type { Orientation } from "@/types/orientation";
import type { ResultEntry } from "@/types/results";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { seededShuffle } from "@/utils/checkpoint/random/seededShuffle";
import { toSingleLine } from "@/utils/text/toSingleLine";

// The three rows of the position puzzle in the order they are shown: the
// leader - the first archetype of the ranking - and two distractors. Of two
// archetypes with the same name the later one in the ranking is left out
// first, so two rows never read the same. The distractors are drawn from the
// four archetypes then ranked right behind the leader, or from all the others
// when there are fewer, and the three rows are shuffled; each of the two
// draws has a purpose of its own, so no other draw shifts them. Nothing when
// fewer than two distractors are left.
export const getPositionPuzzleOptions = (
  archetypes: readonly ResultEntry[],
  seed: string,
): Orientation[] | undefined => {
  const [leader, ...others] = uniqueBy(
    archetypes.map(({ orientation }) => orientation),
    ({ name }) => toSingleLine(name),
  );
  const distractors = seededShuffle(
    others.slice(0, POSITION_PUZZLE_DISTRACTOR_SOURCES),
    seed,
    POSITION_PUZZLE_DISTRACTORS_DRAW,
  ).slice(0, POSITION_PUZZLE_DISTRACTORS);

  return distractors.length === POSITION_PUZZLE_DISTRACTORS
    ? seededShuffle([leader, ...distractors], seed, POSITION_PUZZLE_ORDER_DRAW)
    : undefined;
};
