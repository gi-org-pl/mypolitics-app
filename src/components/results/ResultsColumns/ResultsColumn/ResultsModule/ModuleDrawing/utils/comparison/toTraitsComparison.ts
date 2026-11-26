import type { Orientation } from "@/types/orientation";

import type {
  ModuleComparisonOf,
  ResolvedModuleOf,
} from "../../ModuleDrawing.types";

// The traits the other side earned.
export const toTraitsComparison = (
  { earnedIds }: ResolvedModuleOf<"traits">,
  orientation: Orientation,
): ModuleComparisonOf<"traits"> => ({ orientation, earnedIds });
