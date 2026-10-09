import type { Survey, SurveyVisibleCategory } from "@/types/survey";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

// The categories category select offers: not hidden, and with a name. It is
// the one definition of "visible": the limit, the first phase and the picked
// categories that are kept all count these, whether or not a question of the
// quiz is in them.
export const getVisibleCategories = (survey: Survey): SurveyVisibleCategory[] =>
  survey.categories.filter(
    (category): category is SurveyVisibleCategory =>
      !category.isHidden && toTrimmedText(category.name) !== undefined,
  );
