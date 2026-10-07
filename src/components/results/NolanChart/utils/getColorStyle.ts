import type { CSSProperties } from "react";

export const getColorStyle = (color?: string): CSSProperties | undefined =>
  color ? ({ "--nolan-color": color } as CSSProperties) : undefined;
