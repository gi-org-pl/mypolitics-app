import type {
  CheckpointCandidate,
  CheckpointTriggerInput,
  LeaningAxis,
} from "@/types/checkpoint";

import { getQualifyingAxes } from "./getQualifyingAxes";

// The axis puzzle, once per axis: the best two-sided axis that qualifies and
// has had no card, with both poles as the quiz has them and the side that
// leads - the correct option. A single axis has nothing to guess between and
// is never a candidate.
export const getAxisPuzzleCandidate = ({
  state,
  record,
}: CheckpointTriggerInput):
  | Extract<CheckpointCandidate, { type: "axis-puzzle" }>
  | undefined => {
  const axis = getQualifyingAxes(state.axes, record.cardsShown).find(
    (
      qualifyingAxis,
    ): qualifyingAxis is Extract<LeaningAxis, { kind: "two-sided" }> =>
      qualifyingAxis.kind === "two-sided",
  );

  return axis
    ? {
        type: "axis-puzzle",
        boundary: state.progress.done,
        axisId: axis.id,
        start: axis.start,
        end: axis.end,
        leadingSide: axis.leadingSide,
      }
    : undefined;
};
