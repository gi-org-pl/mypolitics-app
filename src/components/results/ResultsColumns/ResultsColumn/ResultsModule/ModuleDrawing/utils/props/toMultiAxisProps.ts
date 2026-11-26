import type { MultiAxisChartProps } from "@/components/results/MultiAxisChart/MultiAxisChart.types";

import type { ResolvedModuleOf } from "../../ModuleDrawing.types";

// The groups and their axes go as they are.
export const toMultiAxisProps = ({
  title,
  groups,
  marker,
}: ResolvedModuleOf<"multi_axis">): MultiAxisChartProps => ({
  title,
  groups,
  marker,
});
