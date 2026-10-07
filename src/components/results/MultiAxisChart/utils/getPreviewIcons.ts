import type { AxisPair } from "../MultiAxisChart.types";

export const getPreviewIcons = (
  axes: AxisPair[],
  side: "start" | "end",
): string[] =>
  axes
    .map((axis) => axis[side]?.orientation?.imageUrl)
    .filter((imageUrl): imageUrl is string => Boolean(imageUrl));
