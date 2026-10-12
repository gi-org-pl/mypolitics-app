import { z } from "zod";

import { type ApiFailure, ApiFailureKind } from "@/types/api";

const apiFailureSchema = z.union([
  z.object({ kind: z.literal(ApiFailureKind.Http), status: z.number() }),
  z.object({
    kind: z.enum([
      ApiFailureKind.Network,
      ApiFailureKind.Timeout,
      ApiFailureKind.Aborted,
    ]),
  }),
]);

export const isApiFailure = (value: unknown): value is ApiFailure =>
  apiFailureSchema.safeParse(value).success;
