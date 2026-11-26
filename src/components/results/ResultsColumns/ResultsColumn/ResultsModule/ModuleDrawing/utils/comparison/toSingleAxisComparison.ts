import type { Orientation } from "@/types/orientation";

import type {
  ModuleComparisonOf,
  ResolvedModuleOf,
} from "../../ModuleDrawing.types";
import { toComparisonEntry } from "./toComparisonEntry";

// The value of the other side for the same orientation.
export const toSingleAxisComparison = (
  { entry }: ResolvedModuleOf<"single_axis">,
  orientation: Orientation,
): ModuleComparisonOf<"single_axis"> =>
  toComparisonEntry(orientation, entry.value);
