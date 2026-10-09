import { HttpStatusCode } from "axios";

import { type ApiFailure, ApiFailureKind } from "@/types/api";

// The API turned the request down as it was asked: a reply with a 4xx status
// other than "not found".
export const isRefusal = (failure: ApiFailure): boolean =>
  failure.kind === ApiFailureKind.Http &&
  failure.status >= HttpStatusCode.BadRequest &&
  failure.status < HttpStatusCode.InternalServerError &&
  failure.status !== HttpStatusCode.NotFound;
