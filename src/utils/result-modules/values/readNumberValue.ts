import type { ResultModuleValueReader } from "@/types/results";

// A number is the saved value when it is whole and within the bounds of the
// definition. The word the definition names for "off" is read as the
// definition says. Anything else, a key that is left out included, is the
// definition's fallback.
export const readNumberValue: ResultModuleValueReader<"number"> = (
  { min, max, off, fallback },
  value,
) => {
  if (off && value === off.word) return off.reads;

  return typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
    ? value
    : fallback;
};
