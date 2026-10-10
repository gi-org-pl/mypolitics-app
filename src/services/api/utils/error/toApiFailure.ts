import axios, { AxiosError } from "axios";

import { type ApiFailure, ApiFailureKind } from "@/types/api";

import { isApiFailure } from "./isApiFailure";

// Takes anything a request can throw. A failure the client's interceptor has
// already read comes back as it is, so a call can pass whatever it caught.
export const toApiFailure = (error: unknown): ApiFailure => {
  if (isApiFailure(error)) return error;

  if (axios.isCancel(error)) return { kind: ApiFailureKind.Aborted };

  if (!axios.isAxiosError(error)) return { kind: ApiFailureKind.Network };

  if (error.response)
    return { kind: ApiFailureKind.Http, status: error.response.status };

  if (error.code === AxiosError.ETIMEDOUT)
    return { kind: ApiFailureKind.Timeout };

  // The client asks Axios to name a timeout ETIMEDOUT, which leaves
  // ECONNABORTED for a request the browser gave up on.
  if (error.code === AxiosError.ECONNABORTED)
    return { kind: ApiFailureKind.Aborted };

  return { kind: ApiFailureKind.Network };
};
