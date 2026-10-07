import { z } from "zod";

import { trimmedTextSchema } from "@/utils/zod/trimmedTextSchema";

import { packedTextSchema } from "./packedText";

const text = trimmedTextSchema.optional().catch(undefined);
const mark = z.boolean().optional().catch(undefined);

export const orientationTypeResponseSchema = z.enum([
  "IDEOLOGY",
  "PARTY",
  "IDENTITY",
  "COMPASS",
]);

const packedNameResponseSchema = z.object({
  name: text,
  m: text,
  f: text,
  slogan: text,
  websiteUrl: text,
  isOfficial: mark,
  isHidden: mark,
});

const packedImageResponseSchema = z.object({
  m: text,
  f: text,
});

const packedDescriptionResponseSchema = z.object({
  short: text,
  shortDescription: text,
  long: text,
  longDescription: text,
});

export const orientationResponseSchema = z.object({
  id: z.string().min(1),
  type: orientationTypeResponseSchema.optional().catch(undefined),
  generalName: packedTextSchema(packedNameResponseSchema),
  logoUrl: packedTextSchema(packedImageResponseSchema),
  color: text,
  description: packedTextSchema(packedDescriptionResponseSchema),
  explanation: text,
  linkedOrientations: z.array(z.unknown()).optional().catch(undefined),
  surveyId: text,
});

export type OrientationResponse = z.infer<typeof orientationResponseSchema>;
export type OrientationTypeResponse = z.infer<
  typeof orientationTypeResponseSchema
>;
