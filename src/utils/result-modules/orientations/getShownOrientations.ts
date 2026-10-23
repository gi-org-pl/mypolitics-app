import type { Orientation } from "@/types/orientation";
import type { ResolutionContext } from "@/types/results";
import { findOrientation } from "@/utils/orientation/findOrientation";
import { selectOrientations } from "@/utils/orientation/selectOrientations";
import { toDisplayOrientation } from "@/utils/orientation/toDisplayOrientation";

// The shown orientations the identifiers lead to, in the order listed, each in
// its display form for the declared gender. An orientation the quiz does not
// have is left out, and so is a hidden one: hidden wins.
export const getShownOrientations = (
  orientationIds: readonly string[],
  { survey, gender }: Pick<ResolutionContext, "survey" | "gender">,
): Orientation[] =>
  selectOrientations(
    orientationIds.flatMap(
      (id) => findOrientation(survey.orientations, id) ?? [],
    ),
  ).map((orientation) => toDisplayOrientation(orientation, gender));
