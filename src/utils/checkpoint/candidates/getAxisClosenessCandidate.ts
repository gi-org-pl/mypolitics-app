import type {
  CheckpointCandidate,
  CheckpointTriggerInput,
} from "@/types/checkpoint";

import { getQualifyingAxes } from "@/utils/checkpoint/axes/getQualifyingAxes";

// The axis closeness card, once per axis: the best axis that qualifies and
// has had no card. A single axis gives the single variant, about its one fed
// orientation; a two-sided axis gives the double variant, with both sides as
// the quiz has them - the negative side at the start - and the side that
// leads.
export const getAxisClosenessCandidate = ({
  state,
  record,
}: CheckpointTriggerInput):
  | Extract<CheckpointCandidate, { type: "axis-closeness" }>
  | undefined => {
  const [axis] = getQualifyingAxes(state.axes, record.cardsShown);

  if (!axis) return undefined;

  const card = {
    type: "axis-closeness",
    boundary: state.progress.done,
    axisId: axis.id,
  } as const;

  return axis.kind === "single"
    ? { ...card, variant: "single", entry: axis.entry }
    : {
        ...card,
        variant: "double",
        start: axis.start,
        end: axis.end,
        leadingSide: axis.leadingSide,
      };
};
