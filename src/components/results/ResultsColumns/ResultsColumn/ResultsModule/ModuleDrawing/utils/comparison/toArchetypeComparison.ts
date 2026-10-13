import type { Orientation } from "@/types/orientation";

import type {
  ModuleComparisonOf,
  ResolvedModuleOf,
} from "../../ModuleDrawing.types";
import { toEntryValues } from "./toEntryValues";

// The value of the other side for every archetype, by archetype.
export const toArchetypeComparison = (
  { entries }: ResolvedModuleOf<"archetype">,
  orientation: Orientation,
): ModuleComparisonOf<"archetype"> => ({
  orientation,
  values: toEntryValues(entries),
});
