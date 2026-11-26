import type { AxisGroup } from "../MultiAxisChart.types";
import { withGroupColors } from "./withGroupColors";

// The groups the card draws: the ones that hold an axis, each in the colours
// of its group.
export const getDrawnGroups = (groups: AxisGroup[]): AxisGroup[] =>
  (Array.isArray(groups) ? groups : [])
    .filter((group) => Array.isArray(group?.axes) && group.axes.length > 0)
    .map(withGroupColors);
