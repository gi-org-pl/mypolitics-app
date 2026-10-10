import type { SurveySessionAction } from "@/types/survey";

import { canStepBack } from "./canStepBack";

// From e-mail capture the step leads to demographics and removes nothing.
// Anywhere else it leads to the last done question, which is open again with
// no trace of what was picked. A shown card is never removed.
export const stepBack: SurveySessionAction = (_survey, session) => {
  if (!canStepBack(session)) return session;

  if (session.phase === "email-capture") {
    return { ...session, phase: "demographics" };
  }

  const reopenedId = session.entries.at(-1)?.questionId;

  return {
    ...session,
    phase: "questions",
    entries: session.entries.slice(0, -1),
    checkpointRecord: {
      ...session.checkpointRecord,
      timeSamples: session.checkpointRecord.timeSamples.filter(
        ({ questionId }) => questionId !== reopenedId,
      ),
    },
  };
};
