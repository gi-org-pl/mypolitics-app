import { z } from "zod";

import type { ApiFailure } from "@/types/api";

const apiFailureSchema = z.union([
  z.object({ kind: z.literal("http"), status: z.number() }),
  z.object({ kind: z.enum(["network", "timeout", "aborted"]) }),
]);

export const isApiFailure = (value: unknown): value is ApiFailure =>
  apiFailureSchema.safeParse(value).success;
