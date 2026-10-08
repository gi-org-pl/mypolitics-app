import { HttpStatusCode } from "axios";

import type { ApiFailure } from "@/types/api";

// The API turned the request down as it was asked: a reply with a 4xx status
// other than "not found".
export const isRefusal = (failure: ApiFailure): boolean =>
  failure.kind === "http" &&
  failure.status >= HttpStatusCode.BadRequest &&
  failure.status < HttpStatusCode.InternalServerError &&
  failure.status !== HttpStatusCode.NotFound;
