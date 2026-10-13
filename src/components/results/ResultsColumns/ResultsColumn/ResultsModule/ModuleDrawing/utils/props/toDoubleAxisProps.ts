import type { DoubleAxisChartProps } from "@/components/results/DoubleAxisChart/DoubleAxisChart.types";

import type { ResolvedModuleOf } from "../../ModuleDrawing.types";

// The negative side of the axis is the start pole, the positive one the end.
export const toDoubleAxisProps = ({
  axis,
  marker,
}: ResolvedModuleOf<"double_axis">): DoubleAxisChartProps => ({
  start: axis.start,
  end: axis.end,
  marker,
});
