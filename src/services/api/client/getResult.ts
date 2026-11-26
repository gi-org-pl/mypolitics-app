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
