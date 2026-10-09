import type { CategoryResponse } from "@/services/api/schemas/survey";
import type { SurveyCategory } from "@/types/survey";

export const toSurveyCategory = (
  response: CategoryResponse,
): SurveyCategory => {
  const { name } = response;
  const packedName = typeof name === "object" ? name : undefined;

  return {
    id: response.id,
    name: typeof name === "string" ? name : packedName?.name,
    weight: response.weight ?? 0,
    isHidden: packedName?.isHidden === true,
  };
};
