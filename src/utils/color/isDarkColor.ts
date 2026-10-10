import { getColorLuminance } from "./getColorLuminance";

// Below this the palette's dark outlines (--gi-primary) have less than 1.5:1
// against the colour, and something drawn in them is lost on it.
const DARK_LUMINANCE_THRESHOLD = 0.1;

export const isDarkColor = (color?: string): boolean => {
  const luminance = getColorLuminance(color);

  return luminance !== undefined && luminance < DARK_LUMINANCE_THRESHOLD;
};
