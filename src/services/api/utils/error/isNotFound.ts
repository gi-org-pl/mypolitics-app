import { HttpStatusCode } from "axios";

import { type ApiFailure, ApiFailureKind } from "@/types/api";

// The API says that what was asked for does not exist: a reply with 404.
export const isNotFound = (failure: ApiFailure): boolean =>
  failure.kind === ApiFailureKind.Http &&
  failure.status === HttpStatusCode.NotFound;
