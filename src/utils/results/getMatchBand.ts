import { MATCH_FROM, PARTIAL_MATCH_FROM } from "@/constants/results";

export type MatchBand = "none" | "partial" | "match";

const MIN_VALUE = 0;
const MAX_VALUE = 100;

export const getMatchBand = (value?: number): MatchBand => {
  if (typeof value !== "number" || Number.isNaN(value)) return "none";

  const clamped = Math.min(MAX_VALUE, Math.max(MIN_VALUE, value));

  if (clamped >= MATCH_FROM) return "match";
  if (clamped >= PARTIAL_MATCH_FROM) return "partial";

  return "none";
};
