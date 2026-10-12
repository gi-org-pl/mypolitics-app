import type {
  CheckpointAnswerCounts,
  CheckpointQuestionCounts,
} from "@/types/checkpoint";
import type { SurveyQuestion } from "@/types/survey";
import { isCount } from "@/utils/number/isCount";

import { getAnswerSide } from "./getAnswerSide";

// How takers answered one question: the results that chose an agreeing
// answer, those that chose a disagreeing one, those in which the question was
// shown and got neither, and the sample - the takers who answered. An answer
// with no count is read as zero, and a count for an answer the question does
// not have is ignored. Nothing for a question that is not eligible - one with
// an answer off the agreement scale - and for counts that cannot be used: no
// counts, a count that is negative or not a whole number, no result counted,
// or answers that add up to more than the results counted.
export const getQuestionCounts = (
  question: SurveyQuestion,
  answerCounts?: CheckpointAnswerCounts,
): CheckpointQuestionCounts | undefined => {
  const { resultsCounted, chosen } = answerCounts ?? {};
  const sides = { for: 0, against: 0 };

  if (!chosen || !isCount(resultsCounted) || resultsCounted === 0) {
    return undefined;
  }

  for (const answer of question.possibleAnswers) {
    const side = getAnswerSide(question, answer);
    const count = chosen[answer.id] ?? 0;

    if (!side || !isCount(count)) return undefined;

    sides[side] += count;
  }

  const sample = sides.for + sides.against;

  return sample <= resultsCounted
    ? { ...sides, noAnswer: resultsCounted - sample, sample }
    : undefined;
};
