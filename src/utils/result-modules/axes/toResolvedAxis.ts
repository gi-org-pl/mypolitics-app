import type { ResolutionContext, ResolvedAxis } from "@/types/results";
import type { SurveyAxis } from "@/types/survey";

import { toAxisSideEntry } from "./toAxisSideEntry";

// An axis of the quiz with its two poles: the negative side is the start
// entry, the positive side the end entry. An axis that lacks a side cannot be
// drawn, so there is nothing for it.
export const toResolvedAxis = (
  axis: SurveyAxis,
  context: Pick<ResolutionContext, "survey" | "result" | "gender">,
): ResolvedAxis | undefined => {
  const start = toAxisSideEntry(axis.negativeOrientationIds, context);
  const end = toAxisSideEntry(axis.positiveOrientationIds, context);

  return start && end
    ? { id: axis.id, name: axis.name, start, end }
    : undefined;
};
