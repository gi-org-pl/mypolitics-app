import { resultResponseSchema } from "@/services/api/schemas/result";
import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";

import { toSurveyResult } from "./toSurveyResult";

// What a reply of the API to a request for a result says: the result, or
// that the reply is not one.
export const readResult = (
  response: unknown,
  resultId: string,
): ResultLoadResult =>
  resultResponseSchema.safeParse(response).success
    ? {
        status: ResultLoadStatus.Ready,
        result: toSurveyResult(response, resultId),
      }
    : { status: ResultLoadStatus.Failed };
