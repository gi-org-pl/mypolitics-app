import { AXIS_OTHER_SIDE_COLOR } from "@/constants/axis";
import type { NolanPoleSide } from "@/types/results";
import { isDarkFill } from "@/utils/color/isDarkFill";

export const getRowSideColor = (
  side: NolanPoleSide,
  lean?: NolanPoleSide,
  color?: string,
): string | undefined => {
  if (!lean) return undefined;
  if (side === lean) return color;

  return isDarkFill(color) ? AXIS_OTHER_SIDE_COLOR : undefined;
};
