import type { Survey } from "@/types/survey";
import { getQuestionMaximums } from "@/utils/running-state/scores/getQuestionMaximums";
import { getOrientationIds } from "./getOrientationIds";

// The orientations of the quiz that at least one of its questions feeds:
// those some possible answer lists.
export const getFedOrientationIds = (
  survey: Pick<Survey, "orientations" | "questions">,
): Set<string> => {
  const orientationIds = getOrientationIds(survey);

  return new Set(
    survey.questions.flatMap((question) => [
      ...getQuestionMaximums(question, orientationIds).keys(),
    ]),
  );
};
