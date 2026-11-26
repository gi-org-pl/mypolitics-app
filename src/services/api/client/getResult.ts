import {
  buildMock600ResultResponse,
  MOCK_600_TEST_RESULT_ID,
} from "@/mocks/mock600questions";
import { isNotFound } from "@/services/api/utils/error/isNotFound";
import { toApiFailure } from "@/services/api/utils/error/toApiFailure";
import { toRequestConfig } from "@/services/api/utils/request/toRequestConfig";
import { readResult } from "@/services/api/utils/result/readResult";
import type { ApiRequestOptions } from "@/types/api";
import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";
import { apiClient } from "./apiClient";

// Never throws. It says which of the three happened: the API has the result
// (calculated or not yet), the API has no such result, or the read failed.
export const getResult = async (
  resultId: string,
  options?: ApiRequestOptions,
): Promise<ResultLoadResult> => {
  if (resultId === MOCK_600_TEST_RESULT_ID) {
    return readResult(buildMock600ResultResponse(), resultId);
  }
  try {
    const saved = sessionStorage.getItem(`mock-result:${resultId}`);
    if (saved !== null) {
      return readResult(
        buildMock600ResultResponse(JSON.parse(saved)),
        resultId,
      );
    }
  } catch {}

  try {
    const { data } = await apiClient.get<unknown>(
      `/v1/result/${encodeURIComponent(resultId)}`,
      toRequestConfig(options),
    );

    return readResult(data, resultId);
  } catch (error) {
    return isNotFound(toApiFailure(error))
      ? { status: ResultLoadStatus.NotFound }
      : { status: ResultLoadStatus.Failed };
  }
};
