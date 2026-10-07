import type { AxisEntry, AxisOrientation } from "@/types/axis";
import { isNumber } from "@/utils/number/isNumber";

import type { NolanAxisValues } from "../NolanChart.types";

export const getRowComparison = (
  party?: AxisOrientation,
  values?: NolanAxisValues,
): AxisEntry | undefined => {
  const value = values?.start;

  return party && isNumber(value) ? { orientation: party, value } : undefined;
};
