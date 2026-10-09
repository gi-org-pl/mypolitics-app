import {
  possibleAnswerResponseSchema,
  type QuestionAnswerTypeResponse,
  type QuestionResponse,
} from "@/services/api/schemas/survey";
import type { SurveyQuestion, SurveyQuestionAnswerType } from "@/types/survey";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { parseItems } from "@/utils/zod/parseItems";

import { toKnownIds } from "./toKnownIds";

const ANSWER_TYPES: Record<
  QuestionAnswerTypeResponse,
  SurveyQuestionAnswerType
> = {
  AGREE_OR_DISAGREE: "agree-or-disagree",
  ONE_OF_MANY: "one-of-many",
};

export const toSurveyQuestion = (
  response: QuestionResponse,
  quiz: {
    categoryIds: ReadonlySet<string>;
    orientationIds: ReadonlySet<string>;
  },
): SurveyQuestion => {
  const { categoryId, answerType } = response;

  return {
    id: response.id,
    categoryId:
      categoryId !== undefined && quiz.categoryIds.has(categoryId)
        ? categoryId
        : undefined,
    text: response.text,
    explanation: response.explanation,
    answerType: answerType ? ANSWER_TYPES[answerType] : "other",
    possibleAnswers: uniqueBy(
      parseItems(response.possibleAnswers, possibleAnswerResponseSchema),
      ({ id }) => id,
    ).map((answer) => ({
      id: answer.id,
      text: answer.text,
      weight: answer.weight ?? 0,
      orientationIds: toKnownIds(answer.orientationIds, quiz.orientationIds),
    })),
  };
};
