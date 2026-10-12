import type {
  SurveyCheckpointRecord,
  SurveySessionAction,
} from "@/types/survey";

// The checkpoint record is replaced as a whole: this is how the reveal line a
// puzzle drew is kept with its card, so that a guess repeated after a reload
// reads the same words. Nothing else of the session changes - the phase and
// the card that is up stay as they are.
export const setSessionCheckpointRecord: SurveySessionAction<
  [record: SurveyCheckpointRecord]
> = (_survey, session, record) =>
  record === session.checkpointRecord
    ? session
    : { ...session, checkpointRecord: record };
