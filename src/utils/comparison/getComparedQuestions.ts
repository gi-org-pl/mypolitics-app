import type { ComparedQuestion, OtherSide } from "@/types/comparison";
import type { ResultAnswer } from "@/types/results";
import type { Survey } from "@/types/survey";

import { getChosenAnswer } from "./getChosenAnswer";
import { getOtherAnswers } from "./getOtherAnswers";
import { getQuestionAgreement } from "./getQuestionAgreement";

// Every question of the quiz, in the order of the quiz, with what each side
// answers it and how the two stand on it. An answer of either side that names
// a question or an answer the quiz does not have is ignored.
export const getComparedQuestions = (
  survey: Pick<Survey, "questions">,
  answers: readonly ResultAnswer[],
  side: OtherSide,
): ComparedQuestion[] =>
  survey.questions.map((question) => {
    const answer = getChosenAnswer(question, answers);
    const otherAnswers = getOtherAnswers(question, side);

    return {
      question,
      answer,
      otherAnswers,
      agreement: getQuestionAgreement(answer, otherAnswers),
    };
  });
