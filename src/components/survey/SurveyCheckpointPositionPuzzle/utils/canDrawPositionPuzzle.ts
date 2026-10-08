import { PARTIAL_MATCH_FROM } from "@/constants/results";
import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import { safely } from "@/utils/function/safely";
import { isNumber } from "@/utils/number/isNumber";
import { toSingleLine } from "@/utils/text/toSingleLine";

import { POSITION_PUZZLE_ROWS } from "../SurveyCheckpointPositionPuzzle.constants";

// Whether the card can be drawn: exactly three rows with the leader among
// them, every row and the leader named, and a closeness of 50 or more - under
// that the results name nobody, and neither does the card. A name of only
// space is no name: a row without one cannot be guessed. False for a card
// that cannot be read at all.
export const canDrawPositionPuzzle = (
  card: PositionPuzzleCheckpointCard,
): boolean =>
  safely(() => {
    const { leader, closeness, options } = card;

    return (
      options.length === POSITION_PUZZLE_ROWS &&
      options.some(({ id }) => id === leader.id) &&
      [leader, ...options].every(({ name }) => toSingleLine(name) !== "") &&
      isNumber(closeness) &&
      closeness >= PARTIAL_MATCH_FROM
    );
  }, false);
