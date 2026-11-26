import type { SingleAxisChartProps } from "@/components/results/SingleAxisChart/SingleAxisChart.types";

import type { ResolvedModuleOf } from "../ModuleDrawing.types";

export const toSingleAxisProps = ({
  entry,
  marker,
}: ResolvedModuleOf<"single_axis">): SingleAxisChartProps => ({
  orientation: entry.orientation,
  value: entry.value,
  marker,
});
