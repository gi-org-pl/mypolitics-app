import { MAX_AXIS_VALUE } from "@/constants/axis";
import type { CompassPoint } from "@/types/checkpoint";
import type { NolanAxisValues } from "@/types/results";
import { getNolanPosition } from "@/utils/results/getNolanPosition";

const HALF = MAX_AXIS_VALUE / 2;

// The two values of an axis that put a position at the coordinate.
const toAxisValues = (coordinate: number): NolanAxisValues => ({
  start: HALF - coordinate * HALF,
  end: HALF + coordinate * HALF,
});

// A trail for tests and stories: one point per pair of coordinates, each from
// -1 to 1, in the order given and reached at boundaries 1, 2, 3, ... The level
// and the quadrant of a point are the Nolan chart's own, so a trail built
// here is one the running state could have produced. A pair that is not two
// numbers gives no point.
export const createCompassTrail = (
  coordinates: [x: number, y: number][],
): CompassPoint[] =>
  coordinates.flatMap(([x, y], index) => {
    const position = getNolanPosition(toAxisValues(x), toAxisValues(y));

    return position
      ? [
          {
            x,
            y,
            level: position.level,
            quadrant: position.quadrant,
            done: index + 1,
          },
        ]
      : [];
  });
