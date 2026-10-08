import type { CSSProperties } from "react";

import type { CompassMapPoint } from "../CompassMap.types";

const toPercent = (share: number): string => `${share * 100}%`;

export const getPositionStyle = ({ x, y }: CompassMapPoint): CSSProperties =>
  ({
    "--nolan-x": toPercent((x + 1) / 2),
    "--nolan-y": toPercent((1 - y) / 2),
  }) as CSSProperties;
