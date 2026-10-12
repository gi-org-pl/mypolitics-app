import type { Survey, SurveyQuestion, SurveySession } from "@/types/survey";

// The first open question. The entries are always the first questions of the
// quiz, so it is the one right after them.
export const getCurrentQuestion = (
  survey: Survey,
  session: SurveySession,
): SurveyQuestion | undefined => survey.questions.at(session.entries.length);
