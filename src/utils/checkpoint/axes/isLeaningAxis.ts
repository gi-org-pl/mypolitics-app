import {
  SINGLE_AXIS_MIN_VALUE,
  TWO_SIDED_AXIS_MIN_LEAN,
} from "@/constants/checkpoint";
import type { LeaningAxis, RunningAxis } from "@/types/checkpoint";
import { isNumber } from "@/utils/number/isNumber";

// Whether an axis leans clearly, on the exact values: a single axis has a
// value of 70 or more, a two-sided axis a leading side and 15 points or more
// between its sides. 69.6 is not 70, and a lean of 14.99 is not 15. An axis
// with a value absent has no lean, and equal values have no leading side.
export const isLeaningAxis = (axis: RunningAxis): axis is LeaningAxis =>
  isNumber(axis.lean) &&
  (axis.kind === "single"
    ? isNumber(axis.entry.value) && axis.entry.value >= SINGLE_AXIS_MIN_VALUE
    : axis.leadingSide !== undefined && axis.lean >= TWO_SIDED_AXIS_MIN_LEAN);
