import { clamp } from "@/utils/number/clamp";

import type { CompassMapPoint } from "../../CompassMap.types";
import { getMapPoint } from "../../utils/getMapPoint";
import {
  TRAIL_BEND_SHARE,
  TRAIL_VIEW_SIZE,
} from "../CompassMapTrail.constants";

const COORDINATE_DECIMALS = 2;

const toViewPoint = (point: CompassMapPoint): CompassMapPoint => {
  const { x, y } = getMapPoint(point);

  return { x: x * TRAIL_VIEW_SIZE, y: y * TRAIL_VIEW_SIZE };
};

// The direction the line has at a point: from the point before it towards the
// point after it. An end of the line looks at its only neighbour. Nothing
// when the two are one place - the route turned back on itself there.
const getDirection = (
  before: CompassMapPoint,
  after: CompassMapPoint,
): CompassMapPoint => {
  const length = Math.hypot(after.x - before.x, after.y - before.y) || 1;

  return { x: (after.x - before.x) / length, y: (after.y - before.y) / length };
};

// A handle of a curve: it stays on the map, so the bend it makes does too.
const toHandle = (
  point: CompassMapPoint,
  direction: CompassMapPoint,
  reach: number,
): CompassMapPoint => ({
  x: clamp(point.x + direction.x * reach, 0, TRAIL_VIEW_SIZE),
  y: clamp(point.y + direction.y * reach, 0, TRAIL_VIEW_SIZE),
});

const format = ({ x, y }: CompassMapPoint): string =>
  `${Number(x.toFixed(COORDINATE_DECIMALS))} ${Number(y.toFixed(COORDINATE_DECIMALS))}`;

// The path of the line through the points, in the order given, for a square
// of `TRAIL_VIEW_SIZE`: one move and one curve per stretch, so the whole
// trail is a single path however long it is. Every point is the end of a
// curve, so the line passes through each of them and not merely near it. The
// bends are smooth: at a point the line keeps the direction from its
// neighbour before to its neighbour after. Each point is placed with the
// mapping the dot uses. Nothing for fewer than two points.
export const getTrailPath = (points: readonly CompassMapPoint[]): string => {
  if (points.length < 2) return "";

  const places = points.map(toViewPoint);
  const directions = places.map((place, index) =>
    getDirection(places[index - 1] ?? place, places[index + 1] ?? place),
  );

  const curves = places.slice(1).map((end, index) => {
    const start = places[index];
    const reach =
      Math.hypot(end.x - start.x, end.y - start.y) * TRAIL_BEND_SHARE;

    return `C${format(toHandle(start, directions[index], reach))} ${format(
      toHandle(end, directions[index + 1], -reach),
    )} ${format(end)}`;
  });

  return `M${format(places[0])}${curves.join("")}`;
};
