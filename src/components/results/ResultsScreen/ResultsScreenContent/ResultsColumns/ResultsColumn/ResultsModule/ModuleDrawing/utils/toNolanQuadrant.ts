import type { NolanQuadrant } from "@/components/results/NolanChart/NolanChart.types";
import type { NolanQuadrantKey } from "@/types/results";

// A corner of the map: its colour, by the name of the corner, and its names,
// by the slots "<corner><Moderate|Extreme>" and their "Short" forms. A slot
// that is missing leaves the map to its own default.
export const toNolanQuadrant = (
  key: NolanQuadrantKey,
  labels: Record<string, string>,
  colors: Record<string, string>,
): NolanQuadrant => ({
  color: colors[key],
  names: {
    moderate: labels[`${key}Moderate`],
    extreme: labels[`${key}Extreme`],
    moderateShort: labels[`${key}ModerateShort`],
    extremeShort: labels[`${key}ExtremeShort`],
  },
});
