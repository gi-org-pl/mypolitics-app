import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";
import { isNumber } from "@/utils/number/isNumber";

// The other side on one bar: who it is, and their value. Without a value
// there is nothing to lay over the bar.
export const toComparisonEntry = (
  orientation: Orientation,
  value?: number,
): AxisEntry | undefined =>
  isNumber(value) ? { orientation, value } : undefined;
