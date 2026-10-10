// A number as a line prints it: a whole number from `min` to `max`. Nothing
// for any other value.
export const toSlotNumber = (
  value: unknown,
  min: number,
  max = Number.POSITIVE_INFINITY,
): number | undefined =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= min &&
  value <= max
    ? value
    : undefined;
