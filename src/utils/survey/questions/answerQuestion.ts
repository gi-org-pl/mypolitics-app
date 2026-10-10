import type { SurveySessionAction } from "@/types/survey";

import { addSessionEntry } from "./addSessionEntry";
import { getCurrentQuestion } from "./getCurrentQuestion";

// The current question is answered. An answer it does not have changes
// nothing, which is also what makes a second press on the same answer no
// answer to the next question.
export const answerQuestion: SurveySessionAction<
  [answerId: string, seconds?: number]
> = (survey, session, answerId, seconds) => {
  const question = getCurrentQuestion(survey, session);
  const hasAnswer = question?.possibleAnswers.some(({ id }) => id === answerId);

  return session.phase === "questions" && question && hasAnswer
    ? addSessionEntry(
        survey,
        session,
        { questionId: question.id, answerId },
        seconds,
      )
    : session;
};
