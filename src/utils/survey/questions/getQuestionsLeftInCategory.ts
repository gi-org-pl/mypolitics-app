import type { Survey, SurveySession } from "@/types/survey";

// The open questions of the category, the current one included.
export const getQuestionsLeftInCategory = (
  survey: Survey,
  session: SurveySession,
  categoryId: string,
): number =>
  survey.questions
    .slice(session.entries.length)
    .filter((question) => question.categoryId === categoryId).length;
