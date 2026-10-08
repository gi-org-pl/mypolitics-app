import { WHITE_COLOR_PATTERN } from "@/constants/color";
import { getSafeColor } from "@/utils/color/getSafeColor";

export const toOrientationColor = (
  color?: string | null,
): string | undefined => {
  const safeColor = getSafeColor(color ?? undefined);

  return safeColor && !WHITE_COLOR_PATTERN.test(safeColor)
    ? safeColor
    : undefined;
};
