import { resultResponseSchema } from "@/services/api/schemas/result";
import type { SurveyResult } from "@/types/survey";

export const toSurveyResult = (
  response: unknown,
  resultId: string,
): SurveyResult => ({
  id: resultId,
  isCalculated:
    resultResponseSchema.safeParse(response).data?.results !== undefined,
});
