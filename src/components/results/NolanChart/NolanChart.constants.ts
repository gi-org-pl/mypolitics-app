import type { NolanPoleSide, NolanQuadrantKey } from "./NolanChart.types";

export const MAP_MODERATE_RADIUS = Math.SQRT2 / 3;
export const MAP_EXTREME_RADIUS = 1;

export const AXIS_MODERATE_COORDINATE = 1 / 3;
export const AXIS_EXTREME_COORDINATE = 1;

export const LEVEL_TOLERANCE = 1e-9;

export const QUADRANT_KEYS: NolanQuadrantKey[] = [
  "topLeft",
  "topRight",
  "bottomLeft",
  "bottomRight",
];

export const QUADRANT_BY_POLES: Record<
  NolanPoleSide,
  Record<NolanPoleSide, NolanQuadrantKey>
> = {
  start: { start: "bottomLeft", end: "topLeft" },
  end: { start: "bottomRight", end: "topRight" },
};

// The side of a row the taker does not lean to, when the leaning side is dark:
// the literal value of the palette token named beside it, lighter than the
// neutral fallback. A bar's colour check accepts no CSS variables, so the token
// cannot be referenced.
export const ROW_OTHER_SIDE_COLOR = "oklch(0.6057 0.0122 211.04)"; // --gi-gray-hover

export const MAP_CLIP_CLASS_NAME =
  "pointer-events-none absolute inset-0 overflow-hidden rounded-xl";
export const MAP_POINT_CLASS_NAME =
  "absolute top-(--nolan-y) left-(--nolan-x) -translate-1/2 rounded-full";
