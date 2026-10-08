import axios, { AxiosError } from "axios";

import type { ApiFailure } from "@/types/api";

import { isApiFailure } from "./isApiFailure";

// Takes anything a request can throw. A failure the client's interceptor has
// already read comes back as it is, so a call can pass whatever it caught.
export const toApiFailure = (error: unknown): ApiFailure => {
  if (isApiFailure(error)) return error;

  if (axios.isCancel(error)) return { kind: "aborted" };

  if (!axios.isAxiosError(error)) return { kind: "network" };

  if (error.response) return { kind: "http", status: error.response.status };

  if (error.code === AxiosError.ETIMEDOUT) return { kind: "timeout" };

  // The client asks Axios to name a timeout ETIMEDOUT, which leaves
  // ECONNABORTED for a request the browser gave up on.
  if (error.code === AxiosError.ECONNABORTED) return { kind: "aborted" };

  return { kind: "network" };
};
