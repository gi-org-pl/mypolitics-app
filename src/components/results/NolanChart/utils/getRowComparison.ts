import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";
import { isNumber } from "@/utils/number/isNumber";

import type { NolanAxisValues } from "../NolanChart.types";

export const getRowComparison = (
  otherOrientation?: Orientation,
  values?: NolanAxisValues,
): AxisEntry | undefined => {
  const value = values?.start;

  return otherOrientation && isNumber(value)
    ? { orientation: otherOrientation, value }
    : undefined;
};
