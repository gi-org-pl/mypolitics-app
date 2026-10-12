import type { SurveyAxis } from "@/types/survey";

// An axis of type `axis` for a test quiz, with the orientations of its
// negative side and of its positive side.
export const createSurveyAxis = (
  id: string,
  negativeOrientationIds: string[],
  positiveOrientationIds: string[],
  overrides: Partial<SurveyAxis> = {},
): SurveyAxis => ({
  id,
  name: `Oś ${id}`,
  type: "axis",
  negativeOrientationIds,
  positiveOrientationIds,
  isMain: false,
  ...overrides,
});
