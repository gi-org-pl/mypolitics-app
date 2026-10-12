import { MAX_AXIS_VALUE, MIN_AXIS_VALUE } from "@/constants/axis";
import {
  LEVEL_TOLERANCE,
  MAP_EXTREME_RADIUS,
  MAP_MODERATE_RADIUS,
  QUADRANT_BY_POLES,
} from "@/constants/results";
import type {
  NolanAxisValues,
  NolanLevel,
  NolanPoleSide,
  NolanPosition,
} from "@/types/results";
import { clamp } from "@/utils/number/clamp";
import { isNumber } from "@/utils/number/isNumber";

import { getAxisLead } from "./getAxisLead";

const getCoordinate = (start: number, end: number): number =>
  (clamp(end, MIN_AXIS_VALUE, MAX_AXIS_VALUE) -
    clamp(start, MIN_AXIS_VALUE, MAX_AXIS_VALUE)) /
  MAX_AXIS_VALUE;

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
    !isNumber(horizontalStart) ||
    !isNumber(horizontalEnd) ||
    !isNumber(verticalStart) ||
    !isNumber(verticalEnd)
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
