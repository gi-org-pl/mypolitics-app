import { HttpStatusCode } from "axios";

import {
  EMAIL_CONSENT_WORDING,
  RESULT_LINK_TIMEOUT_MS,
  RESULT_LINK_URL,
} from "@/constants/survey";
import { toApiFailure } from "@/services/api/utils/error/toApiFailure";
import { toRequestConfig } from "@/services/api/utils/request/toRequestConfig";
import type { ApiRequestOptions } from "@/types/api";
import type { ResultLinkInput, ResultLinkOutcome } from "@/types/survey";
import { isNumber } from "@/utils/number/isNumber";

import { apiClient } from "./apiClient";

// Asks the endpoint to send the link to a result. One request per call: it
// never repeats itself, and whether to call it at all is the caller's
// decision. The status of the reply decides the outcome and its body is never
// read. Nothing of the address is logged, here or on failure.
export const requestResultLink = async (
  input: ResultLinkInput,
  options?: ApiRequestOptions,
): Promise<ResultLinkOutcome> => {
  if (RESULT_LINK_URL === undefined) return "unavailable";

  try {
    // The address of the endpoint is absolute, so it takes the place of the
    // base address of the client. Nothing is added to it.
    const { status } = await apiClient.post<unknown>(
      RESULT_LINK_URL,
      {
        email: input.email.trim(),
        resultId: input.resultId,
        marketingConsent: input.marketingConsent,
        // Which consent text the taker saw - sent only with consent.
        ...(input.marketingConsent && {
          consentWording: EMAIL_CONSENT_WORDING,
        }),
        language: input.language,
      },
      {
        ...toRequestConfig({
          signal: options?.signal,
          timeoutMs: isNumber(options?.timeoutMs)
            ? options.timeoutMs
            : RESULT_LINK_TIMEOUT_MS,
        }),
        // The request is kept alive: once it has started, the browser
        // finishes it even when the page is reloaded or left, so a link that
        // was asked for is not lost with the page. Only `fetch` can ask for
        // that, so this one call goes through the fetch adapter of Axios; a
        // browser that does not know the flag sends an ordinary request.
        adapter: "fetch",
        fetchOptions: { keepalive: true },
      },
    );

    return status === HttpStatusCode.Accepted ? "accepted" : "unavailable";
  } catch (error) {
    const failure = toApiFailure(error);

    if (failure.kind !== "http") return "unavailable";

    if (failure.status === HttpStatusCode.BadRequest) return "invalid";

    return failure.status === HttpStatusCode.TooManyRequests
      ? "limited"
      : "unavailable";
  }
};
