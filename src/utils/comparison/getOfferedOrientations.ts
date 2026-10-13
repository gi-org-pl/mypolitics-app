import { HEADER_MODULE_TYPE } from "@/constants/results";
import type { Orientation } from "@/types/orientation";
import type { Survey } from "@/types/survey";
import { selectOrientations } from "@/utils/orientation/selectOrientations";
import { toDisplayOrientation } from "@/utils/orientation/toDisplayOrientation";

// The orientations a taker can compare with: the shown orientations of the
// quiz that at least one answer of the quiz lists, in the order of the quiz,
// each in its default form. An orientation no answer lists has no answers to
// compare, so it is not offered.
//
// A quiz whose header is pointed at orientations offers only those: what a
// result is named after is what a result is compared with - the identities of
// one quiz, the candidates of another - and not every ideology that the
// answers happen to feed. A quiz with no header record, or with a header
// pointed at nothing, offers all of them.
export const getOfferedOrientations = (
  survey: Pick<Survey, "orientations" | "questions" | "resultModules">,
): Orientation[] => {
  const listedIds = new Set(
    survey.questions.flatMap(({ possibleAnswers }) =>
      possibleAnswers.flatMap(({ orientationIds }) => orientationIds),
    ),
  );
  const headerIds = new Set(
    survey.resultModules.find(({ type }) => type === HEADER_MODULE_TYPE)
      ?.orientationIds,
  );

  return selectOrientations(survey.orientations)
    .filter(({ id }) => listedIds.has(id))
    .filter(({ id }) => headerIds.size === 0 || headerIds.has(id))
    .map((orientation) => toDisplayOrientation(orientation));
};
