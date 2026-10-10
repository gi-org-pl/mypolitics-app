import { isPositiveNumber } from "@/utils/number/isPositiveNumber";

// A weight as it counts: one that is missing, not a number, zero or negative
// counts as zero.
export const toWeight = (weight: unknown): number =>
  isPositiveNumber(weight) ? weight : 0;
