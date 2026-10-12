import type {
  CheckpointCandidate,
  CheckpointTriggerInput,
} from "@/types/checkpoint";

import { getShownCards } from "@/utils/checkpoint/record/getShownCards";

// The new trait card, once per trait: the first unlocked trait, in the quiz's
// order, that no shown card announced. The unlock is the threshold, so there
// is no gate. The other unlocked traits stay candidates for later boundaries.
export const getNewTraitCandidate = ({
  state,
  record,
}: CheckpointTriggerInput):
  | Extract<CheckpointCandidate, { type: "new-trait" }>
  | undefined => {
  const announcedIds = new Set(
    getShownCards(record.cardsShown, "new-trait").map(({ trait }) => trait.id),
  );
  const trait = state.unlockedTraits.find(({ id }) => !announcedIds.has(id));

  return trait
    ? { type: "new-trait", boundary: state.progress.done, trait }
    : undefined;
};
