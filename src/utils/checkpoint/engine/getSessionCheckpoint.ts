import type {
  CheckpointAggregates,
  CheckpointCard,
  CheckpointType,
} from "@/types/checkpoint";
import type { Survey, SurveySession } from "@/types/survey";
import { readCheckpointRecord } from "@/utils/checkpoint/record/readCheckpointRecord";
import { safely } from "@/utils/function/safely";
import { getRunningState } from "@/utils/running-state/getRunningState";
import { getCurrentQuestion } from "@/utils/survey/questions/getCurrentQuestion";
import { getNextCheckpoint } from "./getNextCheckpoint";

// The card for the boundary the session stands at, or nothing. It is asked
// with the session as it is right after a question was done.
//
// Nothing is worked out - neither the running state nor the engine is run -
// while checkpoints are off, while no type has a card component, and when no
// question is open: after the last question demographics follows, whatever
// the engine would say. A card of a type that is not enabled is dropped.
//
// Never throws: when the running state or the engine fails, there is no card
// and the next question comes.
export const getSessionCheckpoint = (
  survey: Survey,
  session: SurveySession,
  enabledTypes: readonly CheckpointType[],
  aggregates?: CheckpointAggregates,
): CheckpointCard | null =>
  safely(() => {
    if (
      session.areCheckpointsOff ||
      enabledTypes.length === 0 ||
      !getCurrentQuestion(survey, session)
    ) {
      return null;
    }

    const card = getNextCheckpoint({
      survey,
      entries: session.entries,
      state: getRunningState(survey, session),
      record: readCheckpointRecord(session.checkpointRecord),
      seed: session.id,
      isOptedOut: session.areCheckpointsOff,
      enabledTypes,
      aggregates,
    });

    return card && enabledTypes.includes(card.type) ? card : null;
  }, null);
