import { MAX_CATEGORIES } from "@/constants/survey";
import type { Survey } from "@/types/survey";

import { getVisibleCategories } from "./getVisibleCategories";

// One category is always left unpicked, so two visible categories give a
// limit of one, and a quiz with fewer than two has nothing to pick.
export const getCategoryLimit = (survey: Survey): number =>
  Math.max(
    0,
    Math.min(MAX_CATEGORIES, getVisibleCategories(survey).length - 1),
  );
