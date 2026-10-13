import type { SurveyResult } from "@/types/survey";

// A result for a test, as it is read before it is calculated: of no survey,
// without scores and without answers.
export const createSurveyResult = (
  overrides: Partial<SurveyResult> = {},
): SurveyResult => ({
  id: "result",
  isCalculated: false,
  scores: {},
  answers: [],
  ...overrides,
});
