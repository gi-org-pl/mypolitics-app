import type { CSSProperties } from "react";

import type { NolanPosition } from "@/types/results";

const toPercent = (share: number): string => `${share * 100}%`;

export const getPositionStyle = ({ x, y }: NolanPosition): CSSProperties =>
  ({
    "--nolan-x": toPercent((x + 1) / 2),
    "--nolan-y": toPercent((1 - y) / 2),
  }) as CSSProperties;
