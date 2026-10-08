import axios from "axios";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import { toApiFailure } from "@/services/api/utils/error/toApiFailure";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

export const apiClient = axios.create({
  baseURL: toTrimmedText(import.meta.env.VITE_API_URL) ?? DEFAULT_API_URL,
  timeout: API_TIMEOUT_MS,
  transitional: { clarifyTimeoutError: true },
});

// Every failed request is rejected as an ApiFailure. One case never gets
// here: Axios turns down a request whose signal is already aborted before it
// is sent, with an error of its own. A call therefore reads whatever it
// catches with toApiFailure, which takes both.
apiClient.interceptors.response.use(undefined, (error: unknown) =>
  Promise.reject(toApiFailure(error)),
);
