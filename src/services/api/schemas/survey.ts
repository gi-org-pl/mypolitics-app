import { z } from "zod";

import { trimmedTextSchema } from "@/utils/zod/trimmedTextSchema";

import { packedTextSchema } from "./packedText";

const id = z.string().min(1);
const reference = z.string().optional().catch(undefined);
const text = trimmedTextSchema.optional().catch(undefined);
const mark = z.boolean().optional().catch(undefined);
const number = z.number().optional().catch(undefined);
const list = z.array(z.unknown()).optional().catch(undefined);

export const questionAnswerTypeResponseSchema = z.enum([
  "AGREE_OR_DISAGREE",
  "ONE_OF_MANY",
]);

const packedCategoryNameResponseSchema = z.object({
  name: text,
  isHidden: mark,
});

const packedAxisNameResponseSchema = z.object({
  name: text,
  category: text,
  isMain: mark,
});

export const categoryResponseSchema = z.object({
  id,
  name: packedTextSchema(packedCategoryNameResponseSchema),
  weight: number,
});

export const axisResponseSchema = z.object({
  id,
  name: packedTextSchema(packedAxisNameResponseSchema),
  type: text,
  description: text,
  positiveOrientations: list,
  negativeOrientations: list,
});

export const possibleAnswerResponseSchema = z.object({
  id,
  text: trimmedTextSchema,
  weight: number,
  orientationIds: list,
});

// A question that can be asked: one whose status is anything but LIVE or
// absent does not pass, and neither does one without a statement.
export const questionResponseSchema = z.object({
  id,
  categoryId: reference,
  text: trimmedTextSchema,
  explanation: text,
  answerType: questionAnswerTypeResponseSchema.optional().catch(undefined),
  status: z.literal("LIVE").nullish(),
  possibleAnswers: list,
});

// The lists are left as sent: each is read item by item, so that one bad item
// never costs the quiz its others.
export const surveyResponseSchema = z.object({
  title: text,
  type: text,
  averageFinishTime: z.number().min(0).optional().catch(undefined),
  algorithm: text,
  defaultLanguage: text,
  supportedLanguages: list,
  orientations: z.unknown(),
  categories: list,
  axis: list,
  questions: z.array(z.unknown()),
});

export type CategoryResponse = z.infer<typeof categoryResponseSchema>;
export type AxisResponse = z.infer<typeof axisResponseSchema>;
export type QuestionResponse = z.infer<typeof questionResponseSchema>;
export type QuestionAnswerTypeResponse = z.infer<
  typeof questionAnswerTypeResponseSchema
>;
