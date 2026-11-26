import {
  type ResultLoadResult,
  ResultLoadStatus,
  type SurveyResult,
} from "@/types/survey";

import { createSurveyResult } from "./createSurveyResult";

// A read of a result for a test: the API has the result, as
// `createSurveyResult` builds it.
export const createResultLoad = (
  overrides: Partial<SurveyResult> = {},
): Extract<ResultLoadResult, { status: typeof ResultLoadStatus.Ready }> => ({
  status: ResultLoadStatus.Ready,
  result: createSurveyResult(overrides),
});
