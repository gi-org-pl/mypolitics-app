import { getAxisLead } from "@/utils/results/getAxisLead";

import {
  LEVEL_TOLERANCE,
  MAP_EXTREME_RADIUS,
  MAP_MODERATE_RADIUS,
  QUADRANT_BY_POLES,
} from "../NolanChart.constants";
import type {
  NolanAxisValues,
  NolanLevel,
  NolanPoleSide,
  NolanPosition,
} from "../NolanChart.types";

const MIN_VALUE = 0;
const MAX_VALUE = 100;

const isValue = (value: unknown): value is number =>
  typeof value === "number" && !Number.isNaN(value);

const clampValue = (value: number): number =>
  Math.min(MAX_VALUE, Math.max(MIN_VALUE, value));

const getCoordinate = (start: number, end: number): number =>
  (clampValue(end) - clampValue(start)) / MAX_VALUE;

const getPole = (start: number, end: number): NolanPoleSide =>
  getAxisLead(start, end) === "start" ? "start" : "end";

const getLevel = (r: number): NolanLevel => {
  if (r >= MAP_EXTREME_RADIUS - LEVEL_TOLERANCE) return "extreme";
  if (r >= MAP_MODERATE_RADIUS - LEVEL_TOLERANCE) return "moderate";

  return "centre";
};

export const getNolanPosition = (
  horizontal?: NolanAxisValues,
  vertical?: NolanAxisValues,
): NolanPosition | null => {
  const horizontalStart = horizontal?.start;
  const horizontalEnd = horizontal?.end;
  const verticalStart = vertical?.start;
  const verticalEnd = vertical?.end;

  if (
    !isValue(horizontalStart) ||
    !isValue(horizontalEnd) ||
    !isValue(verticalStart) ||
    !isValue(verticalEnd)
  ) {
    return null;
  }

  const x = getCoordinate(horizontalStart, horizontalEnd);
  const y = getCoordinate(verticalStart, verticalEnd);
  const r = Math.hypot(x, y);
  const poles = {
    horizontal: getPole(horizontalStart, horizontalEnd),
    vertical: getPole(verticalStart, verticalEnd),
  };

  return {
    x,
    y,
    r,
    level: getLevel(r),
    quadrant: QUADRANT_BY_POLES[poles.horizontal][poles.vertical],
    poles,
  };
};
