import type { OrientationSide } from "@/types/comparison";
import type { SurveyPossibleAnswer, SurveyQuestion } from "@/types/survey";

// The answers of an orientation to a question: the possible answers of the
// question that list the orientation, in the order of the question. There
// may be none, one or several.
export const getOrientationAnswers = (
  question: Pick<SurveyQuestion, "possibleAnswers">,
  { orientation }: Pick<OrientationSide, "orientation">,
): SurveyPossibleAnswer[] =>
  question.possibleAnswers.filter(({ orientationIds }) =>
    orientationIds.includes(orientation.id),
  );
