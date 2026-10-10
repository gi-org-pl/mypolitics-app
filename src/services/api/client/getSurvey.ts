import { isNotFound } from "@/services/api/utils/error/isNotFound";
import { isRefusal } from "@/services/api/utils/error/isRefusal";
import { toApiFailure } from "@/services/api/utils/error/toApiFailure";
import { toRequestConfig } from "@/services/api/utils/request/toRequestConfig";
import { readSurvey } from "@/services/api/utils/survey/readSurvey";
import type { ApiRequestOptions } from "@/types/api";
import { type SurveyLoadResult, SurveyLoadStatus } from "@/types/survey";

import { apiClient } from "./apiClient";

export const getSurvey = async (
  surveyId: string,
  language: string,
  options?: ApiRequestOptions,
): Promise<SurveyLoadResult> => {
  const url = `/v1/survey/${encodeURIComponent(surveyId)}`;
  const config = toRequestConfig(options);

  try {
    // The API refuses a language the quiz is not written in. Asked once more
    // without one, it sends the quiz in its default language.
    const { data } = await apiClient
      .get<unknown>(url, { ...config, params: { lang: language } })
      .catch((error: unknown) =>
        isRefusal(toApiFailure(error))
          ? apiClient.get<unknown>(url, config)
          : Promise.reject(error),
      );

    return readSurvey(data, surveyId);
  } catch (error) {
    return isNotFound(toApiFailure(error))
      ? { status: SurveyLoadStatus.NotFound }
      : { status: SurveyLoadStatus.Failed };
  }
};
