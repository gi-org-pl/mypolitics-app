import { getColorLuminance } from "./getColorLuminance";

const LIGHT_LUMINANCE_THRESHOLD = 0.5;

export const isLightColor = (color?: string): boolean =>
  (getColorLuminance(color) ?? 0) > LIGHT_LUMINANCE_THRESHOLD;
