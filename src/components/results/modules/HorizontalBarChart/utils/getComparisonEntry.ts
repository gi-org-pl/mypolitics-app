import type { AxisEntry } from "@/components/shared/UniversalAxis/UniversalAxis.types";

import type { RankedComparison } from "../HorizontalBarChart.types";

export const getComparisonEntry = (
  comparison?: RankedComparison,
  orientationId?: string,
): AxisEntry | undefined => {
  if (!comparison?.party || !comparison.values) return undefined;
  if (typeof orientationId !== "string") return undefined;
  if (!Object.hasOwn(comparison.values, orientationId)) return undefined;

  const value = comparison.values[orientationId];

  return typeof value === "number" && !Number.isNaN(value)
    ? { orientation: comparison.party, value }
    : undefined;
};
