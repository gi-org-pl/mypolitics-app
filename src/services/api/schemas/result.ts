import { z } from "zod";

import { stringToJsonObjectSchema } from "@/utils/zod/stringToJsonObjectSchema";
import { trimmedTextSchema } from "@/utils/zod/trimmedTextSchema";

const id = z.string().min(1);

// What the calculation gives one orientation. A number that is not finite
// does not pass.
export const resultOrientationResponseSchema = z.object({
  id,
  points: z.number(),
  maxPossible: z.number(),
});

export const resultAnswerResponseSchema = z.object({
  questionId: id,
  answerId: id,
});

const calculationResponseSchema = z.object({
  orientations: z.array(z.unknown()),
});

// `results` is empty until the result is calculated. The calculation arrives
// as an object or as the text of one; anything else reads as not there.
//
// The lists are left as sent: each is read item by item, so that one bad item
// never costs the result its others.
export const resultResponseSchema = z.object({
  surveyId: trimmedTextSchema.optional().catch(undefined),
  results: z
    .union([
      calculationResponseSchema,
      stringToJsonObjectSchema.pipe(calculationResponseSchema),
    ])
    .optional()
    .catch(undefined),
  answers: z.unknown(),
});

export type ResultOrientationResponse = z.infer<
  typeof resultOrientationResponseSchema
>;
