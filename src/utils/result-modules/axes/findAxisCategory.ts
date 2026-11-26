import type { SurveyAxis, SurveyCategory } from "@/types/survey";

// The category of the quiz an axis belongs to: the first one that has the
// name the axis gives as its category. An axis that names no category, or one
// the quiz does not have, belongs to none.
export const findAxisCategory = (
  { categoryName }: Pick<SurveyAxis, "categoryName">,
  categories: readonly SurveyCategory[],
): SurveyCategory | undefined =>
  categoryName === undefined
    ? undefined
    : categories.find(({ name }) => name === categoryName);
