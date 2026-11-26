import type { NolanQuadrant } from "@/components/results/NolanChart/NolanChart.types";
import { DEFAULT_COMPASS_QUADRANTS } from "@/constants/results";
import type { NolanQuadrantKey } from "@/types/results";

// A corner of the map: its colour, by the name of the corner, and its names,
// by the slots "<corner><Moderate|Extreme>" and their "Short" forms. A corner
// the record gives no colour is drawn in the colour a compass has when the
// quiz sends none; a name that is missing is left to the map.
export const toNolanQuadrant = (
  key: NolanQuadrantKey,
  labels: Record<string, string>,
  colors: Record<string, string>,
): NolanQuadrant => ({
  color: colors[key] ?? DEFAULT_COMPASS_QUADRANTS[key].color,
  names: {
    moderate: labels[`${key}Moderate`],
    extreme: labels[`${key}Extreme`],
    moderateShort: labels[`${key}ModerateShort`],
    extremeShort: labels[`${key}ExtremeShort`],
  },
});
