import type { Survey, SurveyPhase } from "@/types/survey";

import { getTopicLimit } from "./getTopicLimit";

export const getFirstPhase = (survey: Survey): SurveyPhase =>
  getTopicLimit(survey) > 0 ? "category-select" : "questions";
