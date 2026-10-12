import type { SurveyCategory } from "@/types/survey";

// A visible category for a test quiz.
export const createSurveyCategory = (
  id: string,
  overrides: Partial<SurveyCategory> = {},
): SurveyCategory => ({
  id,
  name: `Kategoria ${id}`,
  weight: 1,
  isHidden: false,
  ...overrides,
});
