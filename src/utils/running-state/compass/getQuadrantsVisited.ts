import type { CompassPoint } from "@/types/checkpoint";
import type { NolanLevel, NolanQuadrantKey } from "@/types/results";

const CENTRE_LEVEL: NolanLevel = "centre";

// The quadrants in which at least one point of the trail lies at the moderate
// or the extreme level, in the order they were first visited. A point at the
// centre level is on the trail and visits nothing.
export const getQuadrantsVisited = (
  trail: readonly CompassPoint[],
): NolanQuadrantKey[] => [
  ...new Set(
    trail
      .filter(({ level }) => level !== CENTRE_LEVEL)
      .map(({ quadrant }) => quadrant),
  ),
];
