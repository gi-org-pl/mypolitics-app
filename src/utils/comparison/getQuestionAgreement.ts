import { Agreement } from "@/types/comparison";
import type { SurveyPossibleAnswer } from "@/types/survey";

// How the two sides stand on one question, from the answer of the taker and
// the answers of the other side to it.
//
// Both rows of the table "Agreement on a question" are this one rule, once
// the answers of the other side are named: those of a friend are the one
// they chose, those of an orientation are every answer that lists it.
//
//   agree     the answer of the taker is one of the other side
//   disagree  the taker answered, the other side has an answer, and the
//             answer of the taker is not one of them
//   neither   the taker did not answer, or the other side has no answer
export const getQuestionAgreement = (
  answer: Pick<SurveyPossibleAnswer, "id"> | undefined,
  otherAnswers: readonly Pick<SurveyPossibleAnswer, "id">[],
): Agreement => {
  if (!answer || otherAnswers.length === 0) return Agreement.Neither;

  return otherAnswers.some(({ id }) => id === answer.id)
    ? Agreement.Agree
    : Agreement.Disagree;
};
