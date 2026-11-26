import type { Orientation } from "@/types/orientation";
import type { ResolutionContext, ResolvedCategory } from "@/types/results";
import { getCategoryScores } from "@/utils/result-modules/categories/getCategoryScores";
import { getShownCategories } from "@/utils/result-modules/categories/getShownCategories";

import { getRankedEntries } from "./getRankedEntries";

// One ranking per category of the quiz that is not hidden, in the quiz's
// order: the same orientations, each with its value inside that category. A
// category in which none of them has a value is still there, with entries
// that have no value.
export const getRankedCategories = (
  orientations: readonly Orientation[],
  { survey, result }: Pick<ResolutionContext, "survey" | "result">,
): ResolvedCategory[] =>
  getShownCategories(survey.categories).map(({ id, name }) => ({
    id,
    name,
    entries: getRankedEntries(
      orientations,
      getCategoryScores(survey, result.answers, id),
    ),
  }));
