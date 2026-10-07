import { isNumber } from "@/utils/number/isNumber";

import {
  AXIS_EXTREME_COORDINATE,
  AXIS_MODERATE_COORDINATE,
  LEVEL_TOLERANCE,
} from "../NolanChart.constants";
import type { NolanAxisLevel, NolanLevel } from "../NolanChart.types";

const getLevel = (distance: number): NolanLevel => {
  if (distance >= AXIS_EXTREME_COORDINATE - LEVEL_TOLERANCE) return "extreme";
  if (distance >= AXIS_MODERATE_COORDINATE - LEVEL_TOLERANCE) return "moderate";

  return "centre";
};

export const getAxisLevel = (coordinate: number): NolanAxisLevel => {
  const safeCoordinate = isNumber(coordinate) ? coordinate : 0;

  return {
    level: getLevel(Math.abs(safeCoordinate)),
    pole: safeCoordinate < 0 ? "start" : "end",
  };
};
