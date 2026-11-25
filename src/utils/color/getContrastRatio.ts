import { getColorLuminance } from "./getColorLuminance";

// The contrast ratio of two hex colours as WCAG defines it, from 1 to 21,
// each as it is drawn on a white surface. Undefined when either is not hex.
export const getContrastRatio = (
  first?: string,
  second?: string,
): number | undefined => {
  const firstLuminance = getColorLuminance(first);
  const secondLuminance = getColorLuminance(second);

  if (firstLuminance === undefined || secondLuminance === undefined) {
    return undefined;
  }

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};
