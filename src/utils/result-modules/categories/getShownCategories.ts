import type { SurveyCategory } from "@/types/survey";

// The categories a result is grouped by: the ones that are not hidden, in the
// quiz's order.
export const getShownCategories = (
  categories: readonly SurveyCategory[],
): SurveyCategory[] => categories.filter(({ isHidden }) => !isHidden);
