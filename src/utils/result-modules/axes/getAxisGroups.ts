import type {
  ResolutionContext,
  ResolvedAxisGroup,
  ResultModule,
  ResultModuleGrouping,
  SurveyAxisGroup,
} from "@/types/results";
import type { SurveyAxis, SurveyCategory } from "@/types/survey";

import { getRecordAxes } from "./getRecordAxes";
import { groupAxesByCategory } from "./groupAxesByCategory";
import { toResolvedAxis } from "./toResolvedAxis";

// How each grouping lays out the axes of a record.
const GROUPINGS: Record<
  ResultModuleGrouping,
  (axes: SurveyAxis[], categories: SurveyCategory[]) => SurveyAxisGroup[]
> = {
  none: (axes) => [{ axes }],
  category: groupAxesByCategory,
};

// The groups a record of axes is drawn in, each axis with its two poles. An
// axis that lacks a side is left out of its group, and a group left empty is
// not a group.
export const getAxisGroups = (
  record: Pick<ResultModule, "axisIds"> & { groupBy: ResultModuleGrouping },
  context: Pick<ResolutionContext, "survey" | "result" | "gender">,
): ResolvedAxisGroup[] =>
  GROUPINGS[record.groupBy](
    getRecordAxes(record, context.survey),
    context.survey.categories,
  )
    .map(({ name, axes }) => ({
      name,
      axes: axes.flatMap((axis) => toResolvedAxis(axis, context) ?? []),
    }))
    .filter(({ axes }) => axes.length > 0);
