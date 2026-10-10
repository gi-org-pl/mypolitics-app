import type { Survey, SurveyAnswerEntry, SurveySession } from "@/types/survey";

// The current question becomes done, by an answer or by a skip. The seconds
// are kept as its time sample only when they are a finite number of zero or
// more, and a question has at most one sample.
export const addSessionEntry = (
  survey: Survey,
  session: SurveySession,
  entry: SurveyAnswerEntry,
  seconds?: number,
): SurveySession => {
  const entries = [...session.entries, entry];
  const isTimed =
    typeof seconds === "number" && Number.isFinite(seconds) && seconds >= 0;
  const otherSamples = session.checkpointRecord.timeSamples.filter(
    ({ questionId }) => questionId !== entry.questionId,
  );

  return {
    ...session,
    entries,
    phase:
      entries.length < survey.questions.length ? session.phase : "demographics",
    checkpointRecord: {
      ...session.checkpointRecord,
      timeSamples: isTimed
        ? [...otherSamples, { questionId: entry.questionId, seconds }]
        : otherSamples,
    },
  };
};
