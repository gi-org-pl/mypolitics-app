import { MAP_CLIP_CLASS_NAME } from "../CompassMap.constants";
import type { CompassMapProps } from "../CompassMap.types";
import { TRAIL_CLASS_NAME, TRAIL_VIEW_SIZE } from "./CompassMapTrail.constants";
import { getTrailPath } from "./utils/getTrailPath";
import { getTrailPoints } from "./utils/getTrailPoints";

// The route across the map: one dotted line through the positions in the
// order they were reached, smoothed into curves. It is a single path however
// many points it has, it is complete when the map appears and it never moves.
// Whatever falls outside the map is cut off, as the halo is.
//
// The drawing is stretched over the map, so the path is written in
// percentages of its side, while the width of the line and its dashes stay in
// pixels at every size. The line is not announced: the description of the
// map covers it. Nothing is drawn for fewer than two distinct points.
export const CompassMapTrail = ({ trail }: Pick<CompassMapProps, "trail">) => {
  const path = getTrailPath(getTrailPoints(trail));

  if (!path) return null;

  return (
    <div aria-hidden="true" className={MAP_CLIP_CLASS_NAME}>
      <svg
        viewBox={`0 0 ${TRAIL_VIEW_SIZE} ${TRAIL_VIEW_SIZE}`}
        preserveAspectRatio="none"
        className={TRAIL_CLASS_NAME}
      >
        <path
          data-testid="compass-map-trail"
          d={path}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};
