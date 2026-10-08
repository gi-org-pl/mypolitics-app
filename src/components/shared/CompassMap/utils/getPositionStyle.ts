import type { CSSProperties } from "react";

import type { CompassMapPoint } from "../CompassMap.types";
import { getMapPoint } from "./getMapPoint";

const toPercent = (share: number): string => `${share * 100}%`;

export const getPositionStyle = (position: CompassMapPoint): CSSProperties => {
  const { x, y } = getMapPoint(position);

  return {
    "--nolan-x": toPercent(x),
    "--nolan-y": toPercent(y),
  } as CSSProperties;
};
