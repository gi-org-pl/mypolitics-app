import { MATCH_FROM, PARTIAL_MATCH_FROM } from "@/constants/results";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

export type MatchBand = "none" | "partial" | "match";

const MIN_VALUE = 0;
const MAX_VALUE = 100;

export const getMatchBand = (value?: number): MatchBand => {
  if (!isNumber(value)) return "none";

  const clamped = clamp(value, MIN_VALUE, MAX_VALUE);

  if (clamped >= MATCH_FROM) return "match";
  if (clamped >= PARTIAL_MATCH_FROM) return "partial";

  return "none";
};
