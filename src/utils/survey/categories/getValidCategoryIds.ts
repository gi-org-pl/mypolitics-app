import type { Survey } from "@/types/survey";

import { getCategoryLimit } from "./getCategoryLimit";
import { getVisibleCategories } from "./getVisibleCategories";

// The identifiers that are visible categories of the quiz, each once, in the
// order given, cut to the limit.
export const getValidCategoryIds = (
  survey: Survey,
  prioritizedCategoryIds: readonly unknown[],
): string[] => {
  const visibleIds = new Set(getVisibleCategories(survey).map(({ id }) => id));

  return [...new Set(prioritizedCategoryIds)]
    .filter(
      (categoryId): categoryId is string =>
        typeof categoryId === "string" && visibleIds.has(categoryId),
    )
    .slice(0, getCategoryLimit(survey));
};
