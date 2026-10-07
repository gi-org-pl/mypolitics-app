import { SAFE_COLOR_PATTERN } from "@/constants/color";

export const getSafeColor = (color?: string): string | undefined => {
  const trimmedColor = typeof color === "string" ? color.trim() : "";

  return SAFE_COLOR_PATTERN.test(trimmedColor) ? trimmedColor : undefined;
};
