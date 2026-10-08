import type { AxisEntry } from "@/types/axis";
import type { RankedComparison } from "@/types/results";
import { isNumber } from "@/utils/number/isNumber";

export const getComparisonEntry = (
  comparison?: RankedComparison,
  orientationId?: string,
): AxisEntry | undefined => {
  if (!comparison?.orientation || !comparison.values) return undefined;
  if (typeof orientationId !== "string") return undefined;
  if (!Object.hasOwn(comparison.values, orientationId)) return undefined;

  const value = comparison.values[orientationId];

  return isNumber(value)
    ? { orientation: comparison.orientation, value }
    : undefined;
};
