import type {
  CheckpointCandidate,
  CheckpointCard,
  CheckpointRecord,
} from "@/types/checkpoint";

import { drawCheckpointLine } from "@/utils/checkpoint/lines/drawCheckpointLine";
import { getCardPoolId } from "@/utils/checkpoint/lines/getCardPoolId";
import { getCardPoolIds } from "@/utils/checkpoint/lines/getCardPoolIds";
import { getCheckpointSlots } from "@/utils/checkpoint/slots/getCheckpointSlots";

// A candidate as the card it would be shown as, with its line drawn - or
// nothing when it cannot be put into words: its pool has no line, or the
// slots of a pool it can draw from cannot be filled. A puzzle is checked
// against its ask, hit and miss pools, so a card that is shown can always
// finish its reveal.
export const toCheckpointCard = (
  candidate: CheckpointCandidate,
  record: Pick<CheckpointRecord, "cardsShown">,
  seed: string,
): CheckpointCard | undefined => {
  const line = drawCheckpointLine(getCardPoolId(candidate), record, seed);
  const canBeWorded = getCardPoolIds(candidate).every(
    (pool) => getCheckpointSlots(candidate, pool) !== undefined,
  );

  return line && canBeWorded ? { ...candidate, line } : undefined;
};
