import { ARCHETYPE_ORIENTATION_TYPE } from "@/constants/checkpoint";
import type { RunningScore } from "@/types/checkpoint";
import type { ResultEntry } from "@/types/results";
import type { Survey } from "@/types/survey";
import { getSideValue } from "@/utils/running-state/scores/getSideValue";
import { getFedOrientationIds } from "./getFedOrientationIds";
import { toNamedOrientation } from "./toNamedOrientation";

// A value is never below zero, so this puts an archetype without one last.
const NO_VALUE_RANK = -1;

// The named positions of the quiz - its identity orientations that are shown,
// have a name and are fed by at least one question - each with its value as
// its closeness, the closest first. Equal values keep the quiz's order, and a
// position without a value comes after every position that has one.
export const getRunningArchetypes = (
  survey: Pick<Survey, "orientations" | "questions">,
  scores: Readonly<Record<string, RunningScore>>,
): ResultEntry[] => {
  const fedIds = getFedOrientationIds(survey);

  return survey.orientations
    .flatMap((quizOrientation) => {
      const orientation =
        quizOrientation.type === ARCHETYPE_ORIENTATION_TYPE &&
        fedIds.has(quizOrientation.id)
          ? toNamedOrientation(quizOrientation)
          : undefined;

      return orientation
        ? [{ orientation, value: getSideValue(scores, [orientation.id]) }]
        : [];
    })
    .sort(
      (first, second) =>
        (second.value ?? NO_VALUE_RANK) - (first.value ?? NO_VALUE_RANK),
    );
};
