import { z } from "zod";

import { stringToJsonObjectSchema } from "@/utils/zod/stringToJsonObjectSchema";
import { trimmedTextSchema } from "@/utils/zod/trimmedTextSchema";

const plainTextSchema = trimmedTextSchema.refine(
  (text) => !text.startsWith("{"),
);

export const packedTextSchema = <
  T extends z.ZodType<unknown, Record<string, unknown>>,
>(
  packedSchema: T,
) =>
  z
    .union([stringToJsonObjectSchema.pipe(packedSchema), plainTextSchema])
    .optional()
    .catch(undefined);
