import type { NolanChartProps } from "@/components/results/NolanChart/NolanChart.types";

import type { ResolvedModuleOf } from "../ModuleDrawing.types";
import { toNolanAxis } from "./toNolanAxis";
import { toNolanQuadrant } from "./toNolanQuadrant";

// The two axes with their names, and the labels and colours of the record by
// slot: into the names of the poles, the four corners and the middle.
export const toNolanChartProps = ({
  horizontal,
  vertical,
  labels,
  colors,
}: ResolvedModuleOf<"nolan_chart">): NolanChartProps => ({
  horizontal: toNolanAxis(horizontal, "horizontal", labels),
  vertical: toNolanAxis(vertical, "vertical", labels),
  quadrants: {
    topLeft: toNolanQuadrant("topLeft", labels, colors),
    topRight: toNolanQuadrant("topRight", labels, colors),
    bottomLeft: toNolanQuadrant("bottomLeft", labels, colors),
    bottomRight: toNolanQuadrant("bottomRight", labels, colors),
  },
  centreName: labels.centre,
});
