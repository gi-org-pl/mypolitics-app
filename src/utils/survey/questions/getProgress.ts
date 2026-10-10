import type { Survey, SurveyProgress, SurveySession } from "@/types/survey";

export const getProgress = (
  survey: Survey,
  session: SurveySession,
): SurveyProgress => ({
  done: session.entries.length,
  all: survey.questions.length,
});
