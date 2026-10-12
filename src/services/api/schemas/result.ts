import { z } from "zod";

import { stringToJsonObjectSchema } from "@/utils/zod/stringToJsonObjectSchema";

const calculationResponseSchema = z.object({
  orientations: z.array(z.unknown()),
});

// `results` is empty until the result is calculated. The calculation arrives
// as an object or as the text of one; anything else reads as not there.
export const resultResponseSchema = z.object({
  results: z
    .union([
      calculationResponseSchema,
      stringToJsonObjectSchema.pipe(calculationResponseSchema),
    ])
    .optional()
    .catch(undefined),
});
