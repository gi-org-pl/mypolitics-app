import type { DoneQuestion } from "@/types/checkpoint";
import type { ResultAnswer } from "@/types/results";
import type { Survey } from "@/types/survey";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { getDoneQuestions } from "@/utils/running-state/progress/getDoneQuestions";

// Every question of the quiz, in the quiz's order, with the answer the result
// gives it. A result is of the whole quiz, so a question it does not answer
// is here as well, as a skip: it gives no points and still counts its full
// maximum. Of two answers to one question the first counts. An answer to a
// question the quiz does not have is ignored, and so is an answer the
// question does not have.
export const getResultQuestions = (
  survey: Pick<Survey, "questions">,
  answers: ResultAnswer[],
): DoneQuestion[] => {
  const answerIds = new Map(
    uniqueBy(answers, ({ questionId }) => questionId).map(
      ({ questionId, answerId }) => [questionId, answerId],
    ),
  );

  return getDoneQuestions(
    survey,
    survey.questions.map(({ id }) => ({
      questionId: id,
      answerId: answerIds.get(id),
    })),
  );
};
