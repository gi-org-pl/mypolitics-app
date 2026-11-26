import { AXIS_OTHER_SIDE_COLOR } from "@/constants/axis";
import type { AxisEntry } from "@/types/axis";
import { getSafeColor } from "@/utils/color/getSafeColor";

// The end side of a bar, in a colour the start side does not have. Two sides
// drawn in the same colour cannot be told apart - most often two orientations
// the quiz gives no colour, which a bar draws in one grey. The end side then
// takes the lighter grey of the palette; otherwise it keeps its own colour.
export const toDistinctEnd = (start: AxisEntry, end: AxisEntry): AxisEntry =>
  getSafeColor(start.orientation.color) === getSafeColor(end.orientation.color)
    ? {
        ...end,
        orientation: { ...end.orientation, color: AXIS_OTHER_SIDE_COLOR },
      }
    : end;
