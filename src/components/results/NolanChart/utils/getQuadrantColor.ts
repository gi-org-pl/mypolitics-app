import { getSafeColor } from "@/utils/color/getSafeColor";

import type { NolanPosition, NolanQuadrants } from "../NolanChart.types";

export const getQuadrantColor = (
  quadrants: Partial<NolanQuadrants> | undefined,
  position: NolanPosition | null,
): string | undefined =>
  position ? getSafeColor(quadrants?.[position.quadrant]?.color) : undefined;
