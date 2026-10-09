import type { Survey, SurveyPhase } from "@/types/survey";

import { getCategoryLimit } from "./getCategoryLimit";

export const getFirstPhase = (survey: Survey): SurveyPhase =>
  getCategoryLimit(survey) > 0 ? "category-select" : "questions";
