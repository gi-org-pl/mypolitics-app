import type { SurveyCategory } from "../SurveyCategorySelect.types";

export const getValidSelection = (
  selectedIds: string[],
  categories: SurveyCategory[],
): string[] => {
  const knownIds = new Set(categories.map((category) => category.id));

  return [...new Set(selectedIds)].filter((id) => knownIds.has(id));
};
