import type { SurveyCategory, SurveyQuestion } from "@/types/survey";
import { isPositiveNumber } from "@/utils/number/isPositiveNumber";

const NO_MULTIPLIER = 1;

// How much an answer to the question counts: the weight of its category when
// the taker prioritised that category, otherwise 1. A weight that cannot be
// counted with - missing, not a number, zero or negative - is 1 too.
export const getQuestionMultiplier = (
  question: Pick<SurveyQuestion, "categoryId">,
  categories: readonly SurveyCategory[],
  topicIds: readonly string[],
): number => {
  const { categoryId } = question;

  if (categoryId === undefined || !topicIds.includes(categoryId)) {
    return NO_MULTIPLIER;
  }

  const weight = categories.find(({ id }) => id === categoryId)?.weight;

  return isPositiveNumber(weight) ? weight : NO_MULTIPLIER;
};
