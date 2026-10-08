import type { NolanPoleSide } from "@/types/results";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { NolanAxis } from "../NolanChart.types";
import { getAxisLevel } from "./getAxisLevel";

export const getPoleName = (
  axis: NolanAxis,
  lean?: NolanPoleSide,
  coordinate?: number,
): string => {
  if (!lean || coordinate === undefined) return "";

  const { level } = getAxisLevel(coordinate);

  return level === "centre" ? "" : toSingleLine(axis[lean]?.names?.[level]);
};
