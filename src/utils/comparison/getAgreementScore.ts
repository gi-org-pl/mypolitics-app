import type { OtherSide } from "@/types/comparison";
import type { ResultAnswer } from "@/types/results";
import type { Survey } from "@/types/survey";

import { getAgreementShare } from "./getAgreementShare";
import { getComparedQuestions } from "./getComparedQuestions";

// The agreement score of a comparison, 0-100: of the questions the two sides
// can be compared on, the share they agree on. It counts questions, not
// points: a question weighs the same whatever its category or the weight of
// its answers. There is no score when no question agrees or disagrees.
//
// It is derived: the same quiz, answers and other side always give the same
// score.
export const getAgreementScore = (
  survey: Pick<Survey, "questions">,
  answers: readonly ResultAnswer[],
  side: OtherSide,
): number | undefined =>
  getAgreementShare(
    getComparedQuestions(survey, answers, side).map(
      ({ agreement }) => agreement,
    ),
  );
