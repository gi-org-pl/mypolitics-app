import type { SurveyAxis, SurveyCategory } from "@/types/survey";

import { findAxisCategory } from "./findAxisCategory";

// Of the axes, the ones that belong to the category, in the order given.
// Without a category: the ones that belong to no category of the quiz.
export const getCategoryAxes = (
  axes: readonly SurveyAxis[],
  categories: readonly SurveyCategory[],
  category?: SurveyCategory,
): SurveyAxis[] =>
  axes.filter((axis) => findAxisCategory(axis, categories) === category);
