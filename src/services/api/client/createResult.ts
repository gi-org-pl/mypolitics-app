import { HttpStatusCode } from "axios";

import { toApiFailure } from "@/services/api/utils/error/toApiFailure";
import { toRequestConfig } from "@/services/api/utils/request/toRequestConfig";
import { ApiFailureKind, type ApiRequestOptions } from "@/types/api";
import { CreateResultOutcome, type ResultInput } from "@/types/survey";

import { apiClient } from "./apiClient";

export const createResult = async (
  input: ResultInput,
  options?: ApiRequestOptions,
): Promise<CreateResultOutcome> => {
  try {
    const { status } = await apiClient.post<unknown>(
      "/v1/result",
      input,
      toRequestConfig(options),
    );

    return status === HttpStatusCode.Created
      ? CreateResultOutcome.Stored
      : CreateResultOutcome.Refused;
  } catch (error) {
    const failure = toApiFailure(error);

    if (failure.kind !== ApiFailureKind.Http)
      return CreateResultOutcome.Unreachable;

    // A result with this session identifier already exists: an earlier try
    // got through, so the result is stored.
    return failure.status === HttpStatusCode.Conflict
      ? CreateResultOutcome.Stored
      : CreateResultOutcome.Refused;
  }
};
