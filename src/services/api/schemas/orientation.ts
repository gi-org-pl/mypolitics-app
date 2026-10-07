import { z } from "zod";

const text = z.string().nullish().catch(undefined);

export const orientationResponseSchema = z.object({
  id: z.string().min(1),
  type: text,
  generalName: text,
  logoUrl: text,
  color: text,
  description: text,
  explanation: text,
  linkedOrientations: z.array(z.unknown()).nullish().catch(undefined),
  surveyId: text,
});

export type OrientationResponse = z.infer<typeof orientationResponseSchema>;
