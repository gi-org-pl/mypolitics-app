import type { DoneQuestion } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import type { Survey } from "@/types/survey";

import { getOrientationIds } from "./getOrientationIds";
import { isTraitUnlocked } from "./isTraitUnlocked";
import { toNamedOrientation } from "./toNamedOrientation";

// The traits of the list that are unlocked, in the quiz's order, each once.
// A trait the quiz does not have, a hidden one and one without a name are
// never unlocked. No survey marks its traits, so without a list there are
// none.
export const getUnlockedTraits = (
  survey: Pick<Survey, "orientations" | "questions">,
  doneQuestions: readonly DoneQuestion[],
  traitIds: readonly string[] = [],
): Orientation[] => {
  const listedIds = new Set(traitIds);
  const orientationIds = getOrientationIds(survey);

  return survey.orientations.flatMap((quizOrientation) => {
    const orientation = listedIds.has(quizOrientation.id)
      ? toNamedOrientation(quizOrientation)
      : undefined;

    return orientation &&
      isTraitUnlocked(orientation.id, survey, doneQuestions, orientationIds)
      ? [orientation]
      : [];
  });
};
