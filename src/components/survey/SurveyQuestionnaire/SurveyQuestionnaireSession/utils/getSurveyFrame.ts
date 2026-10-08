import type { Survey, SurveySession } from "@/types/survey";
import { canReset } from "@/utils/survey/canReset";
import { canStepBack } from "@/utils/survey/canStepBack";
import { getCurrentQuestion } from "@/utils/survey/getCurrentQuestion";
import { getProgress } from "@/utils/survey/getProgress";
import { getQuestionsLeftInCategory } from "@/utils/survey/getQuestionsLeftInCategory";
import { getVisibleCategories } from "@/utils/survey/getVisibleCategories";
import {
  ALMOST_DONE_LABEL,
  ALMOST_READY_LABEL,
  GO_BACK_LABEL,
} from "../SurveyQuestionnaireSession.constants";
import type { SurveyFrame } from "../SurveyQuestionnaireSession.types";

// The bar and the controls bar of a session, for every phase - also for the
// phases whose content comes with a later task. Whether back and reset work is
// the session's to say, never decided here.
export const getSurveyFrame = (
  survey: Survey,
  session: SurveySession,
): SurveyFrame => {
  const controls = {
    canStepBack: canStepBack(session),
    canReset: canReset(session),
  };
  const progress = getProgress(survey, session);

  switch (session.phase) {
    case "category-select":
      // Nothing is done yet: the bar is empty and the pill names the quiz.
      return { ...controls, progress };
    case "questions":
    // A card keeps the bar and the pill of the question that follows it.
    case "checkpoints": {
      const categoryId = getCurrentQuestion(survey, session)?.categoryId;
      const category = getVisibleCategories(survey).find(
        ({ id }) => id === categoryId,
      );

      // A hidden, nameless or missing category: the pill names the quiz.
      return category
        ? {
            ...controls,
            progress,
            categoryName: category.name,
            questionsLeft: getQuestionsLeftInCategory(
              survey,
              session,
              category.id,
            ),
          }
        : { ...controls, progress };
    }
    case "demographics":
      return { ...controls, label: ALMOST_DONE_LABEL };
    case "email-capture":
      // Every question is behind the taker: the bar is full.
      return {
        ...controls,
        progress: { done: progress.all, all: progress.all },
        label: ALMOST_DONE_LABEL,
        previousLabel: GO_BACK_LABEL,
      };
    case "results-calculation":
      return { ...controls, label: ALMOST_READY_LABEL };
    default:
      // Short results are the results module's: no bar, and the quiz name.
      return controls;
  }
};
