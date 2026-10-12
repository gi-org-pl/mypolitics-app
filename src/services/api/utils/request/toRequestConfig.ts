import type { AxiosRequestConfig } from "axios";

import { API_TIMEOUT_MS } from "@/constants/api";
import type { ApiRequestOptions } from "@/types/api";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

// Axios reads a timeout of 0 as "no time limit", so the shortest limit a
// caller can get is one millisecond.
const SHORTEST_TIMEOUT_MS = 1;

// A caller may shorten the time limit of the client and never lengthen it or
// switch it off. Without a limit of its own a request gets the client's.
export const toRequestConfig = (
  options?: ApiRequestOptions,
): AxiosRequestConfig => {
  const timeoutMs = options?.timeoutMs;

  return {
    signal: options?.signal,
    timeout: isNumber(timeoutMs)
      ? clamp(timeoutMs, SHORTEST_TIMEOUT_MS, API_TIMEOUT_MS)
      : undefined,
  };
};
