import type { ResultAnswer } from "@/types/results";
import type { SurveyPossibleAnswer, SurveyQuestion } from "@/types/survey";

// The possible answer a result chose for a question. There is none when the
// result does not answer the question, or names an answer the question does
// not have. Of two answers to one question the first counts, as it does when
// the result is resolved.
export const getChosenAnswer = (
  question: Pick<SurveyQuestion, "id" | "possibleAnswers">,
  answers: readonly ResultAnswer[],
): SurveyPossibleAnswer | undefined => {
  const chosen = answers.find(({ questionId }) => questionId === question.id);

  return (
    chosen && question.possibleAnswers.find(({ id }) => id === chosen.answerId)
  );
};
