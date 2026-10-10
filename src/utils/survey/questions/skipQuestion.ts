import type { SurveySessionAction } from "@/types/survey";

import { addSessionEntry } from "./addSessionEntry";
import { getCurrentQuestion } from "./getCurrentQuestion";

// "Pomiń" under a question: it is done, with no answer.
export const skipQuestion: SurveySessionAction<[seconds?: number]> = (
  survey,
  session,
  seconds,
) => {
  const question = getCurrentQuestion(survey, session);

  return session.phase === "questions" && question
    ? addSessionEntry(survey, session, { questionId: question.id }, seconds)
    : session;
};
