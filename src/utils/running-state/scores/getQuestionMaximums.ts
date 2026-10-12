import type { SurveyQuestion } from "@/types/survey";

import { toKnownOrientationIds } from "@/utils/running-state/orientations/toKnownOrientationIds";
import { toWeight } from "./toWeight";

// The most a question can give each orientation it feeds: the highest weight
// among the possible answers that list the orientation. The multiplier is not
// applied here.
export const getQuestionMaximums = (
  question: Pick<SurveyQuestion, "possibleAnswers">,
  orientationIds: ReadonlySet<string>,
): Map<string, number> => {
  const maximums = new Map<string, number>();

  for (const answer of question.possibleAnswers) {
    const weight = toWeight(answer.weight);

    for (const id of toKnownOrientationIds(
      answer.orientationIds,
      orientationIds,
    )) {
      maximums.set(id, Math.max(maximums.get(id) ?? 0, weight));
    }
  }

  return maximums;
};
