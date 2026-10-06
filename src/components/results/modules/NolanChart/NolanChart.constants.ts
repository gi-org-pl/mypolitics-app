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
