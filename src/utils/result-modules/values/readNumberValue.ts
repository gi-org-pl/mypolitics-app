import type { ResultModuleValueReader } from "@/types/results";
import { isNumber } from "@/utils/number/isNumber";

// A number is the saved value when it is within the bounds of the definition,
// and whole where the definition asks for that. Nothing is read as `false`
// where the definition allows nothing. Anything else, a key that is left out
// included, is the definition's fallback.
export const readNumberValue: ResultModuleValueReader<"number"> = (
  { min, max, whole, nullable, fallback },
  value,
) => {
  if (value === null && nullable) return false;

  return isNumber(value) &&
    value >= min &&
    value <= max &&
    (!whole || Number.isInteger(value))
    ? value
    : fallback;
};
