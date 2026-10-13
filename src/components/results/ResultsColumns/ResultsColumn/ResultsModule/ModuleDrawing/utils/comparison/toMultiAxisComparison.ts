import type { Orientation } from "@/types/orientation";
import { toNumbersByKey } from "@/utils/number/toNumbersByKey";
import type {
  ModuleComparisonOf,
  ResolvedModuleOf,
} from "../../ModuleDrawing.types";

// The start-side value of the other side for every axis, by axis.
export const toMultiAxisComparison = (
  { groups }: ResolvedModuleOf<"multi_axis">,
  orientation: Orientation,
): ModuleComparisonOf<"multi_axis"> => ({
  orientation,
  values: toNumbersByKey(
    groups.flatMap(({ axes }) =>
      axes.map(({ id, start }) => [id, start.value]),
    ),
  ),
});
