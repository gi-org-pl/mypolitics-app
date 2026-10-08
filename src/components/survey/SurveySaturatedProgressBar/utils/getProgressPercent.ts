import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

// Progress as a percentage, from 0 to 100. A quiz with no questions, or a
// number that is not one, gives an empty bar; more done than there is gives a
// full one. Fractions are used as given.
export const getProgressPercent = (value: number, maxValue: number): number =>
  isNumber(value) && isNumber(maxValue) && maxValue > 0
    ? clamp((value / maxValue) * 100, 0, 100)
    : 0;
