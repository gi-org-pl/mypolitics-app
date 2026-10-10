import { ROW_OTHER_SIDE_COLOR } from "../NolanChart.constants";
import type { NolanPoleSide } from "../NolanChart.types";
import { isDarkFill } from "./isDarkFill";

export const getRowSideColor = (
  side: NolanPoleSide,
  lean?: NolanPoleSide,
  color?: string,
): string | undefined => {
  if (!lean) return undefined;
  if (side === lean) return color;

  return isDarkFill(color) ? ROW_OTHER_SIDE_COLOR : undefined;
};
