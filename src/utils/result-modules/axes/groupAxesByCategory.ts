import type { SurveyAxisGroup } from "@/types/results";
import type { SurveyAxis, SurveyCategory } from "@/types/survey";
import { getShownCategories } from "@/utils/result-modules/categories/getShownCategories";

import { findAxisCategory } from "./findAxisCategory";

// The axes by category: one group per category of the quiz that is not
// hidden, in the quiz's order and named after it, and after them one group
// with no name for the axes that belong to no category of the quiz. Inside a
// group the axes keep their order. An axis of a hidden category is in no
// group, and a group may be empty.
export const groupAxesByCategory = (
  axes: readonly SurveyAxis[],
  categories: readonly SurveyCategory[],
): SurveyAxisGroup[] => {
  const getAxesOf = (category?: SurveyCategory): SurveyAxis[] =>
    axes.filter((axis) => findAxisCategory(axis, categories) === category);

  return [
    ...getShownCategories(categories).map((category) => ({
      name: category.name,
      axes: getAxesOf(category),
    })),
    { axes: getAxesOf() },
  ];
};
