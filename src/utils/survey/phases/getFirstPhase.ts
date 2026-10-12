import type { Survey, SurveyPhase } from "@/types/survey";

import { getCategoryLimit } from "@/utils/survey/categories/getCategoryLimit";

// Category select is part of a quiz only when something can be picked in it:
// a quiz with fewer than two visible categories starts on the questions, as
// a session that skipped the select does.
export const getFirstPhase = (survey: Survey): SurveyPhase =>
  getCategoryLimit(survey) > 0 ? "category-select" : "questions";
