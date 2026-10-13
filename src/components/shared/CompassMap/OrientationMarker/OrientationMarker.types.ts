import type { Orientation } from "@/types/orientation";

import type { CompassMapPoint } from "../CompassMap.types";

export interface OrientationMarkerProps {
  orientation?: Orientation;
  position: CompassMapPoint;
}
