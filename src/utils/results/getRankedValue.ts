import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

const MIN_VALUE = 0;
const MAX_VALUE = 100;

export const getRankedValue = (entry?: { value?: number }): number | null => {
  const value = entry?.value;

  return isNumber(value) ? clamp(value, MIN_VALUE, MAX_VALUE) : null;
};
