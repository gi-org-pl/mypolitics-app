import { z } from "zod";

// The answer counts of one quiz, as the questionnaire asks a source for them.
// No endpoint serves them yet: these are the names of the contract, and when a
// source ships with other names, only this file and `readAnswerCounts` change.

const id = z.string().min(1);

// An item of `answers` that says which possible answer it counts. What else
// it holds is checked afterwards, so that an item without an identifier can be
// told from one with a count that is not a number.
export const identifiedAnswerResponseSchema = z.looseObject({
  answerId: id,
});

// A count is passed as sent, negative or fractional too: the engine refuses
// the question then. An answer may come without one.
export const answerCountResponseSchema = z.object({
  answerId: id,
  count: z.number().optional(),
});

export const questionCountsResponseSchema = z.object({
  questionId: id,
  resultsCounted: z.number(),
  answers: z.array(z.unknown()),
});

// The lists are left as sent: each is read item by item, so that one bad
// question never costs the others.
export const answerCountsResponseSchema = z.object({
  computedAt: z.iso.datetime({ offset: true }),
  questions: z.array(z.unknown()),
});

export type QuestionCountsResponse = z.infer<
  typeof questionCountsResponseSchema
>;
