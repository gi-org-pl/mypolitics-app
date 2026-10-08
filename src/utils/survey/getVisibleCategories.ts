import type { Survey, SurveyVisibleCategory } from "@/types/survey";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

export const getVisibleCategories = (survey: Survey): SurveyVisibleCategory[] =>
  survey.categories.filter(
    (category): category is SurveyVisibleCategory =>
      !category.isHidden && toTrimmedText(category.name) !== undefined,
  );
