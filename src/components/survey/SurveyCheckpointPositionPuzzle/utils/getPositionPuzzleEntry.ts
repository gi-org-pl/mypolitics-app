import { MATCH_BAND_COLORS } from "@/constants/results";
import type { AxisEntry } from "@/types/axis";
import type { PositionPuzzleCheckpointCard } from "@/types/checkpoint";
import type { CheckpointGuessState } from "@/utils/checkpoint/useCheckpointGuess";
import { getMatchBand } from "@/utils/results/getMatchBand";

import { HIDDEN_ORIENTATION } from "../SurveyCheckpointPositionPuzzle.constants";

// What the bar of the card is drawn from in a state. Its length is the
// closeness of the card in every state: the bar is true from the moment the
// card appears. Who it is about is held back while the card asks and after a
// miss - a blank orientation in the neutral colour - and is the leader after
// a hit, in the colour of the band its closeness falls into and never in its
// own.
export const getPositionPuzzleEntry = (
  card: PositionPuzzleCheckpointCard,
  state: CheckpointGuessState,
): AxisEntry => ({
  orientation:
    state === "hit"
      ? {
          ...card.leader,
          color: MATCH_BAND_COLORS[getMatchBand(card.closeness)],
        }
      : HIDDEN_ORIENTATION,
  value: card.closeness,
});
