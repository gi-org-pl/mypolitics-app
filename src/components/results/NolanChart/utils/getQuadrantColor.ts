import type { NolanPosition } from "@/types/results";
import { getSafeColor } from "@/utils/color/getSafeColor";

import type { NolanQuadrants } from "../NolanChart.types";

export const getQuadrantColor = (
  quadrants: Partial<NolanQuadrants> | undefined,
  position: NolanPosition | null,
): string | undefined =>
  position ? getSafeColor(quadrants?.[position.quadrant]?.color) : undefined;
