import type { CompassPoint } from "@/types/checkpoint";
import { isNumber } from "@/utils/number/isNumber";

// Where the taker stands on the path card: the last point of the trail. A
// card is stored JSON, so its trail can be anything: nothing when there is no
// last point, or when its `x` or its `y` is not a number - such a point
// cannot be put on the map.
export const getPathPosition = (
  trail?: readonly CompassPoint[] | null,
): CompassPoint | null => {
  const last = Array.isArray(trail) ? trail.at(-1) : undefined;

  return last && isNumber(last.x) && isNumber(last.y) ? last : null;
};
