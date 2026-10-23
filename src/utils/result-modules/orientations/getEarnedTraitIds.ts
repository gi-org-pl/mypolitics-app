import type { Orientation } from "@/types/orientation";
import type { ResolutionContext } from "@/types/results";
import { getResultQuestions } from "@/utils/result-modules/getResultQuestions";
import { getOrientationIds } from "@/utils/running-state/orientations/getOrientationIds";
import { isTraitUnlocked } from "@/utils/running-state/orientations/isTraitUnlocked";

// The identifiers of the traits that are earned, in the order given: the
// ones that scored all they could in the whole quiz, by the rule that unlocks
// a trait mid-quiz.
export const getEarnedTraitIds = (
  traits: readonly Orientation[],
  { survey, result }: Pick<ResolutionContext, "survey" | "result">,
): string[] => {
  const questions = getResultQuestions(survey, result.answers);
  const orientationIds = getOrientationIds(survey);

  return traits
    .map(({ id }) => id)
    .filter((id) => isTraitUnlocked(id, survey, questions, orientationIds));
};
