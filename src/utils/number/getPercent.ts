import { clamp } from "./clamp";
import { isNumber } from "./isNumber";

// A part of a whole as a percentage, from 0 to 100. A whole of zero or less,
// or a number that is not one, gives 0; a part larger than the whole gives
// 100. Fractions are used as given.
export const getPercent = (part: number, whole: number): number =>
  isNumber(part) && isNumber(whole) && whole > 0
    ? clamp((part / whole) * 100, 0, 100)
    : 0;
