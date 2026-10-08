import type { DoneQuestion } from "@/types/checkpoint";
import type { Survey } from "@/types/survey";
import { getDoneQuestions } from "@/utils/running-state/getDoneQuestions";

// The first questions of a test quiz as done questions, one per item and in
// the quiz's order: answered with the possible answer of that identifier, or
// skipped when the item is undefined.
export const createDoneQuestions = (
  survey: Pick<Survey, "questions">,
  answerIds: (string | undefined)[],
): DoneQuestion[] =>
  getDoneQuestions(
    survey,
    answerIds.map((answerId, index) => ({
      questionId: survey.questions[index].id,
      answerId,
    })),
  );
