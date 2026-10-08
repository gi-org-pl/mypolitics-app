import type { AxiosRequestConfig } from "axios";

import type { ApiRequestOptions } from "@/types/api";

export const toRequestConfig = (
  options?: ApiRequestOptions,
): AxiosRequestConfig => ({
  signal: options?.signal,
  timeout: options?.timeoutMs,
});
