import type { DoneQuestion } from "@/types/checkpoint";
import type { Survey, SurveyAnswerEntry } from "@/types/survey";

// The done questions, in the order of the entries. An entry for a question
// the quiz does not have is ignored, an answer the question does not have
// makes it a skip, and of two entries for one question the later one counts,
// at its own place.
export const getDoneQuestions = (
  survey: Pick<Survey, "questions">,
  entries: readonly SurveyAnswerEntry[],
): DoneQuestion[] => {
  const questionsById = new Map(
    survey.questions.map((question) => [question.id, question]),
  );
  const doneById = new Map<string, DoneQuestion>();

  for (const { questionId, answerId } of entries) {
    const question = questionsById.get(questionId);

    if (!question) continue;

    doneById.delete(questionId);
    doneById.set(questionId, {
      question,
      answer: question.possibleAnswers.find(({ id }) => id === answerId),
    });
  }

  return [...doneById.values()];
};
