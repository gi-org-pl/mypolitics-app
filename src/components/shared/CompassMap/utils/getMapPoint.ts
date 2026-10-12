import type { CompassMapPoint } from "../CompassMap.types";

// Where a position lies on the map, as shares of its width and its height:
// `x` from the left edge, `y` from the top edge, 0 to 1 each. The horizontal
// axis runs left to right and the vertical one bottom to top. Everything
// drawn on the map - the dot, its halo, the other side, the trail - is placed
// through this one mapping, so two marks can never disagree.
export const getMapPoint = ({ x, y }: CompassMapPoint): CompassMapPoint => ({
  x: (x + 1) / 2,
  y: (1 - y) / 2,
});
