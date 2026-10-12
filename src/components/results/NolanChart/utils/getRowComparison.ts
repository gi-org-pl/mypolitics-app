import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";
import type { NolanAxisValues } from "@/types/results";
import { isNumber } from "@/utils/number/isNumber";

export const getRowComparison = (
  otherOrientation?: Orientation,
  values?: NolanAxisValues,
): AxisEntry | undefined => {
  const value = values?.start;

  return otherOrientation && isNumber(value)
    ? { orientation: otherOrientation, value }
    : undefined;
};
