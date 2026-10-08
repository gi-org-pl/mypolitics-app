import type { NolanPoleSide, NolanQuadrantKey } from "@/types/results";
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

// The Nolan chart: the distance from the centre at which a position is
// moderate and extreme, and the quadrant each pair of poles stands for.
export const MAP_MODERATE_RADIUS = Math.SQRT2 / 3;
export const MAP_EXTREME_RADIUS = 1;

export const LEVEL_TOLERANCE = 1e-9;

export const QUADRANT_BY_POLES: Record<
  NolanPoleSide,
  Record<NolanPoleSide, NolanQuadrantKey>
> = {
  start: { start: "bottomLeft", end: "topLeft" },
  end: { start: "bottomRight", end: "topRight" },
};

// The colours a compass is drawn in when the quiz sends none, by corner: red
// top left, blue top right, green bottom left, purple bottom right. Literal
// values of the Tailwind palette tokens named beside them - the tokens
// closest to the colours of the design: the map's colour check accepts no CSS
// variables, so the tokens cannot be referenced.
export const DEFAULT_COMPASS_QUADRANTS: Record<
  NolanQuadrantKey,
  { color: string }
> = {
  topLeft: { color: "oklch(70.4% 0.191 22.216)" }, // --color-red-400
  topRight: { color: "oklch(74.6% 0.16 232.661)" }, // --color-sky-400
  bottomLeft: { color: "oklch(76.5% 0.177 163.223)" }, // --color-emerald-400
  bottomRight: { color: "oklch(54.1% 0.281 293.009)" }, // --color-violet-600
};
