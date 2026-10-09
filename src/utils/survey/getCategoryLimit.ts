import { MAX_TOPICS } from "@/constants/survey";
import type { Survey } from "@/types/survey";

import { getVisibleCategories } from "./getVisibleCategories";

// One category is always left unpicked, so two visible categories give one
// topic, and a quiz with fewer than two has no topics to pick.
export const getCategoryLimit = (survey: Survey): number =>
  Math.max(0, Math.min(MAX_TOPICS, getVisibleCategories(survey).length - 1));
