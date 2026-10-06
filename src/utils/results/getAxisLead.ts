import { MAX_AXIS_VALUE, MIN_AXIS_VALUE } from "@/constants/axis";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

export type AxisLead = "start" | "end" | null;

const getDisplayedValue = (value?: number): number =>
  isNumber(value)
    ? Math.round(clamp(value, MIN_AXIS_VALUE, MAX_AXIS_VALUE))
    : MIN_AXIS_VALUE;

export const getAxisLead = (start?: number, end?: number): AxisLead => {
  const displayedStart = getDisplayedValue(start);
  const displayedEnd = getDisplayedValue(end);

  if (displayedStart > displayedEnd) return "start";
  if (displayedEnd > displayedStart) return "end";

  return null;
};
