import type { Orientation } from "@/types/orientation";

import type {
  ModuleComparisonOf,
  ResolvedModuleOf,
} from "../../ModuleDrawing.types";
import { toComparisonEntry } from "./toComparisonEntry";

// The start-side value of the other side for the same axis.
export const toDoubleAxisComparison = (
  { axis }: ResolvedModuleOf<"double_axis">,
  orientation: Orientation,
): ModuleComparisonOf<"double_axis"> =>
  toComparisonEntry(orientation, axis.start.value);
