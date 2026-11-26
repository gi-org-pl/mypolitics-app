import {
  resultAnswerResponseSchema,
  resultResponseSchema,
} from "@/services/api/schemas/result";
import type { SurveyResult } from "@/types/survey";
import { parseItems } from "@/utils/zod/parseItems";

import { readResultScores } from "./readResultScores";

// A reply that is not a result reads as a result that holds nothing: not
// calculated, of no survey, without scores and without answers.
export const toSurveyResult = (
  response: unknown,
  resultId: string,
): SurveyResult => {
  const { data } = resultResponseSchema.safeParse(response);

  return {
    id: resultId,
    isCalculated: data?.results !== undefined,
    surveyId: data?.surveyId,
    scores: readResultScores(data?.results?.orientations),
    answers: parseItems(data?.answers, resultAnswerResponseSchema),
  };
};
