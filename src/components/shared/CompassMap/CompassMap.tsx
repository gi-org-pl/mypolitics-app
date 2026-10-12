import { getSafeColor } from "@/utils/color/getSafeColor";
import { isDarkFill } from "@/utils/color/isDarkFill";

import type { CompassMapProps } from "./CompassMap.types";
import { CompassMapTrail } from "./CompassMapTrail/CompassMapTrail";
import { OrientationMarker } from "./OrientationMarker/OrientationMarker";
import { QuadrantGrid } from "./QuadrantGrid/QuadrantGrid";
import { TakerDot } from "./TakerDot/TakerDot";

// The square map of a compass: four quadrants, the one the taker stands in
// filled when the position is moderate or extreme, the route travelled so
// far as a dotted line, the taker's dot with its halo, and the other side of
// a comparison - in that order, the last on top. On a filled quadrant that
// is dark, or has no colour of its own, the dot gets a white ring. It is as wide as its parent
// and always square. Nothing on it can be pressed, hovered or focused.
//
// With a description the map is one image. Without one it has no role and no
// name of its own, and the parent describes it.
export const CompassMap = ({
  quadrants,
  position,
  trail,
  otherOrientation,
  otherPosition,
  description,
}: CompassMapProps) => {
  const filledQuadrant =
    position && position.level !== "centre" ? position.quadrant : null;

  return (
    <div
      data-testid="nolan-chart-map"
      role={description ? "img" : undefined}
      aria-label={description || undefined}
      className="relative aspect-square w-full min-w-0 rounded-xl bg-white"
    >
      <QuadrantGrid quadrants={quadrants} filledQuadrant={filledQuadrant} />
      <CompassMapTrail trail={trail} />
      {position && (
        <TakerDot
          position={position}
          isOnDarkFill={
            filledQuadrant !== null &&
            isDarkFill(getSafeColor(quadrants?.[filledQuadrant]?.color))
          }
        />
      )}
      {otherPosition && (
        <OrientationMarker
          orientation={otherOrientation}
          position={otherPosition}
        />
      )}
    </div>
  );
};
