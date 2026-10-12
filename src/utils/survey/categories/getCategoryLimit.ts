import {
  MAX_CATEGORIES_RATIO,
  MIN_CATEGORIES_FOR_SELECT,
} from "@/constants/survey";
import type { Survey } from "@/types/survey";

import { getVisibleCategories } from "./getVisibleCategories";

// How many categories may be picked: half of the visible ones, rounded - a
// half goes up, so three give two and five give three. A quiz with fewer than
// two visible categories has no category select, and nothing can be picked.
export const getCategoryLimit = (survey: Survey): number => {
  const visibleCount = getVisibleCategories(survey).length;

  return visibleCount < MIN_CATEGORIES_FOR_SELECT
    ? 0
    : Math.round(visibleCount * MAX_CATEGORIES_RATIO);
};
