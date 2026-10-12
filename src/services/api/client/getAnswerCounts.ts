import { readAnswerCounts } from "@/services/api/utils/answer-counts/readAnswerCounts";
import { toRequestConfig } from "@/services/api/utils/request/toRequestConfig";
import type { ApiRequestOptions } from "@/types/api";
import type { CheckpointAggregates } from "@/types/checkpoint";
import { toWebAddress } from "@/utils/url/toWebAddress";

import { apiClient } from "./apiClient";

// The usable answer counts of one quiz, or nothing. The source is the address
// the build was given in `VITE_ANSWER_COUNTS_URL`: while it is not set - the
// state of the product today, as no endpoint counts answers - nothing is
// requested at all. The request names the quiz and nothing about the taker.
//
// One request per call, and it never rejects: a source that fails, does not
// answer in time or answers with counts that cannot be used gives nothing.
// Nothing is logged.
export const getAnswerCounts = async (
  surveyId: string,
  options?: ApiRequestOptions,
): Promise<CheckpointAggregates | undefined> => {
  const url = toWebAddress(import.meta.env.VITE_ANSWER_COUNTS_URL);

  if (url === undefined) return undefined;

  try {
    // The address of the source is absolute, so it takes the place of the
    // base address of the client.
    const { data } = await apiClient.get<unknown>(url, {
      ...toRequestConfig(options),
      params: { surveyId },
    });

    return readAnswerCounts(data, new Date());
  } catch {
    return undefined;
  }
};
