import { toRequestConfig } from "@/services/api/utils/request/toRequestConfig";
import { toSurveyResult } from "@/services/api/utils/result/toSurveyResult";
import type { ApiRequestOptions } from "@/types/api";
import type { SurveyResult } from "@/types/survey";

import { apiClient } from "./apiClient";

export const getResult = async (
  resultId: string,
  options?: ApiRequestOptions,
): Promise<SurveyResult> => {
  try {
    const { data } = await apiClient.get<unknown>(
      `/v1/result/${encodeURIComponent(resultId)}`,
      toRequestConfig(options),
    );

    return toSurveyResult(data, resultId);
  } catch {
    return toSurveyResult(undefined, resultId);
  }
};
