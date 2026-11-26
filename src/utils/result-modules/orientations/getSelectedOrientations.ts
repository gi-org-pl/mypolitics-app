import type { Orientation } from "@/types/orientation";
import type {
  ResolutionContext,
  ResultModule,
  ResultModuleSelection,
} from "@/types/results";

import { getLinkedOrientations } from "./getLinkedOrientations";
import { getShownOrientations } from "./getShownOrientations";

// Which of a record's shown orientations each selection keeps.
const SELECTIONS: Record<
  ResultModuleSelection,
  (orientations: Orientation[], leader?: Orientation) => Orientation[]
> = {
  all: (orientations) => orientations,
  linked_to_leader: getLinkedOrientations,
};

// The orientations a record shows: its shown ones, as its selection keeps
// them.
export const getSelectedOrientations = (
  record: Pick<ResultModule, "orientationIds"> & {
    selection: ResultModuleSelection;
  },
  context: Pick<ResolutionContext, "survey" | "gender" | "leader">,
): Orientation[] =>
  SELECTIONS[record.selection](
    getShownOrientations(record.orientationIds, context),
    context.leader?.orientation,
  );
