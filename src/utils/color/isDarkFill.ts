import { isDarkColor } from "@/utils/color/isDarkColor";

export const isDarkFill = (color?: string): boolean =>
  !color || isDarkColor(color);
