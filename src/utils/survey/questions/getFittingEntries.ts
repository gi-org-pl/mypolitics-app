import type { Survey, SurveyAnswerEntry } from "@/types/survey";

// The stored entries that still fit the quiz as read now. The first one that
// does not - it cannot be read, it names a question that is not at its place,
// or an answer that question does not have - ends the list: an entry after a
// gap would no longer be one of the first questions.
export const getFittingEntries = (
  survey: Survey,
  entries: readonly (SurveyAnswerEntry | undefined)[],
): SurveyAnswerEntry[] => {
  const fittingEntries: SurveyAnswerEntry[] = [];

  for (const [index, entry] of entries.entries()) {
    const question = survey.questions.at(index);
    const isAnswerKnown =
      entry?.answerId === undefined ||
      question?.possibleAnswers.some(({ id }) => id === entry.answerId);

    if (!entry || question?.id !== entry.questionId || !isAnswerKnown) break;

    fittingEntries.push(entry);
  }

  return fittingEntries;
};
