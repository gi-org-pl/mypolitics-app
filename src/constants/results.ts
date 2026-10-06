import type { MatchBand } from "@/utils/results/getMatchBand";

export const PARTIAL_MATCH_FROM = 50;
export const MATCH_FROM = 80;

// Literal values of the Athena palette tokens named beside them: a bar's
// colour check accepts no CSS variables, so the tokens cannot be referenced.
export const MATCH_BAND_COLORS: Record<MatchBand, string> = {
  none: "oklch(0.601 0.2132 25.79)", // --gi-red
  partial: "oklch(0.7387 0.1464 73.45)", // --gi-orange
  match: "oklch(0.6166 0.1744 138.04)", // --gi-green
};
