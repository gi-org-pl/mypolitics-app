import type { Orientation } from "@/types/orientation";

import type {
  ModuleComparisonOf,
  ResolvedModuleOf,
} from "../../ModuleDrawing.types";
import { toEntryValues } from "./toEntryValues";

// The value of the other side for every orientation, by orientation. In a
// list by category it is their value inside each category, by category: a
// category is never given their value in the whole result.
export const toHorizontalBarComparison = (
  other: ResolvedModuleOf<"horizontal_bar">,
  orientation: Orientation,
): ModuleComparisonOf<"horizontal_bar"> =>
  "categories" in other
    ? {
        orientation,
        values: {},
        categoryValues: Object.fromEntries(
          other.categories.map(({ id, entries }) => [
            id,
            toEntryValues(entries),
          ]),
        ),
      }
    : { orientation, values: toEntryValues(other.entries) };
