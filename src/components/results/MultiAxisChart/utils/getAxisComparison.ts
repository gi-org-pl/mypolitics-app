import type { AxisEntry } from "@/types/axis";
import { isNumber } from "@/utils/number/isNumber";

import type { AxisComparison, AxisPair } from "../MultiAxisChart.types";

export const getAxisComparison = (
  axis: AxisPair,
  comparison?: AxisComparison,
): AxisEntry | undefined => {
  const value = comparison?.values?.[axis.id];

  return comparison?.orientation && isNumber(value)
    ? { orientation: comparison.orientation, value }
    : undefined;
};
