import { isNumber } from "@/utils/number/isNumber";

import type { CompassMapPoint } from "../../CompassMap.types";
import { TRAIL_STEPS_PER_UNIT } from "../CompassMapTrail.constants";

const toStep = (coordinate: number): number =>
  Math.round(coordinate * TRAIL_STEPS_PER_UNIT);

const isSamePlace = (first: CompassMapPoint, second: CompassMapPoint) =>
  toStep(first.x) === toStep(second.x) && toStep(first.y) === toStep(second.y);

// The points the line goes through, in the order given. A point whose `x` or
// `y` is not a number is left out. Neighbours that are the same to two
// decimals are one point, and of such a run the last one is kept, so that the
// line ends exactly under the dot. Equal points that are not neighbours both
// stay: the route came back, and it is drawn as travelled. Nothing else is
// dropped or sampled, and the list given is not changed.
export const getTrailPoints = (
  trail?: readonly CompassMapPoint[] | null,
): CompassMapPoint[] => {
  if (!Array.isArray(trail)) return [];

  const points: CompassMapPoint[] = trail.filter(
    (point) => isNumber(point?.x) && isNumber(point?.y),
  );

  return points.filter((point, index) => {
    const next = points[index + 1];

    return !next || !isSamePlace(point, next);
  });
};
