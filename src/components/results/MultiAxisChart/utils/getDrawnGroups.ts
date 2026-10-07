import type { AxisGroup } from "../MultiAxisChart.types";

export const getDrawnGroups = (groups: AxisGroup[]): AxisGroup[] =>
  (Array.isArray(groups) ? groups : []).filter(
    (group) => Array.isArray(group?.axes) && group.axes.length > 0,
  );
