import type { NolanPosition } from "@/types/results";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { NolanName, NolanQuadrants } from "../NolanChart.types";

const NO_NAME: NolanName = { name: "", shortName: "" };

export const getQuadrantName = (
  quadrants: Partial<NolanQuadrants> | undefined,
  position: NolanPosition | null,
): NolanName => {
  if (!position || position.level === "centre") return NO_NAME;

  const names = quadrants?.[position.quadrant]?.names;
  const levels =
    position.level === "moderate"
      ? (["moderate", "extreme"] as const)
      : (["extreme", "moderate"] as const);
  const level = levels.find((key) => toSingleLine(names?.[key]) !== "");

  return level
    ? {
        name: toSingleLine(names?.[level]),
        shortName: toSingleLine(names?.[`${level}Short`]),
      }
    : NO_NAME;
};
