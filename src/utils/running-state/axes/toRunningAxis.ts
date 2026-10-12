import { SINGLE_AXIS_MIDPOINT } from "@/constants/checkpoint";
import type { AxisEntry } from "@/types/axis";
import type { RunningAxis, RunningTwoSidedAxis } from "@/types/checkpoint";
import { isNumber } from "@/utils/number/isNumber";

const getTwoSidedLean = (
  start?: number,
  end?: number,
): Pick<RunningTwoSidedAxis, "lean" | "leadingSide"> => {
  if (!isNumber(start) || !isNumber(end)) {
    return { lean: undefined, leadingSide: undefined };
  }

  if (start === end) return { lean: 0, leadingSide: undefined };

  return start > end
    ? { lean: start - end, leadingSide: "start" }
    : { lean: end - start, leadingSide: "end" };
};

// An axis by the sides that are fed. With both it is two-sided: the lean is
// the higher value minus the lower one, and the leading side is the higher
// one. With one it is single, and leans from the midpoint. With none there is
// no axis to speak about. The lean comes from the exact values and is absent
// while a value it needs is.
export const toRunningAxis = (
  axis: Pick<RunningAxis, "id" | "answered">,
  start?: AxisEntry,
  end?: AxisEntry,
): RunningAxis | undefined => {
  if (start && end) {
    return {
      ...axis,
      kind: "two-sided",
      start,
      end,
      ...getTwoSidedLean(start.value, end.value),
    };
  }

  const entry = start ?? end;

  return entry
    ? {
        ...axis,
        kind: "single",
        entry,
        lean: isNumber(entry.value)
          ? entry.value - SINGLE_AXIS_MIDPOINT
          : undefined,
      }
    : undefined;
};
