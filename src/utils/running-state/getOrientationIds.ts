import type { Survey } from "@/types/survey";

// The identifiers of the orientations a quiz has.
export const getOrientationIds = (
  survey: Pick<Survey, "orientations">,
): Set<string> => new Set(survey.orientations.map(({ id }) => id));
