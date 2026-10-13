import type { Orientation } from "@/types/orientation";
import type { Survey } from "@/types/survey";
import { selectOrientations } from "@/utils/orientation/selectOrientations";
import { toDisplayOrientation } from "@/utils/orientation/toDisplayOrientation";

// The orientations a taker can compare with: the shown orientations of the
// quiz that at least one answer of the quiz lists, in the order of the quiz,
// each in its default form. An orientation no answer lists has no answers to
// compare, so it is not offered.
export const getOfferedOrientations = (
  survey: Pick<Survey, "orientations" | "questions">,
): Orientation[] => {
  const listedIds = new Set(
    survey.questions.flatMap(({ possibleAnswers }) =>
      possibleAnswers.flatMap(({ orientationIds }) => orientationIds),
    ),
  );

  return selectOrientations(survey.orientations)
    .filter(({ id }) => listedIds.has(id))
    .map((orientation) => toDisplayOrientation(orientation));
};
