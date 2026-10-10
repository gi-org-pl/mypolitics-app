import { useCallback, useEffect, useMemo } from "react";

import type { CheckpointOutcome } from "@/types/checkpoint";
import type { SurveySessionApi } from "@/types/survey";
import { drawRevealLine } from "@/utils/checkpoint/lines/drawRevealLine";
import { readCheckpointRecord } from "@/utils/checkpoint/record/readCheckpointRecord";
import { readShownCard } from "@/utils/checkpoint/record/readShownCard";

import { CHECKPOINT_CARDS } from "../../../SurveyQuestionnaire.constants";
import type { CheckpointCardControls } from "../SurveyQuestionnaireCheckpoints.types";

// The card of the Checkpoints phase and what can be done with it.
//
// The card that is up is the last item of the cards shown, as the session
// stores it - also after a reload, which brings the same card back with the
// same values and wording. It is read from the stored item itself and not
// from the checked record, where a dropped item would leave an earlier card
// in the last place. When that item cannot be read as a card, or its type has
// no component, there is nothing to put up: the checkpoint is closed and the
// next question is shown.
//
// A puzzle asks for its reveal line on a guess. A line that is newly drawn is
// written back to the session with the record that holds it, so the same
// guess after a reload reads the same words; the card stays up.
export const useCheckpointCard = ({
  session,
  closeCheckpoint,
  turnCheckpointsOff,
  setCheckpointRecord,
}: SurveySessionApi): CheckpointCardControls => {
  const { id, checkpointRecord } = session;
  const shownCard = useMemo(
    () => readShownCard(checkpointRecord.cardsShown.at(-1))?.card,
    [checkpointRecord],
  );
  const card = shownCard && CHECKPOINT_CARDS[shownCard.type] ? shownCard : null;
  const hasCard = card !== null;

  useEffect(() => {
    if (!hasCard) {
      closeCheckpoint();
    }
  }, [hasCard, closeCheckpoint]);

  const reveal = useCallback(
    (outcome: CheckpointOutcome) => {
      if (!hasCard) return undefined;

      const record = readCheckpointRecord(checkpointRecord);
      const { line, record: nextRecord } = drawRevealLine(record, outcome, id);

      if (nextRecord !== record) {
        setCheckpointRecord(nextRecord);
      }

      return line;
    },
    [hasCard, checkpointRecord, id, setCheckpointRecord],
  );

  return {
    card,
    reveal,
    close: closeCheckpoint,
    optOut: turnCheckpointsOff,
  };
};
