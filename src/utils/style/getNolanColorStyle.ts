import type { CSSProperties } from "react";

export const getNolanColorStyle = (
  color?: string,
): CSSProperties | undefined =>
  color ? ({ "--nolan-color": color } as CSSProperties) : undefined;
