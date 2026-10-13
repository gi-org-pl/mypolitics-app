import type { Orientation } from "@/types/orientation";

import type {
  ModuleComparisonOf,
  ResolvedModuleOf,
} from "../../ModuleDrawing.types";

// The four side values of the other side: both sides of both axes.
export const toNolanComparison = (
  { horizontal, vertical }: ResolvedModuleOf<"nolan_chart">,
  orientation: Orientation,
): ModuleComparisonOf<"nolan_chart"> => ({
  orientation,
  horizontal: { start: horizontal.start.value, end: horizontal.end.value },
  vertical: { start: vertical.start.value, end: vertical.end.value },
});
