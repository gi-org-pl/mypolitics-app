import type { AxisPair } from "../../MultiAxisChart.types";
import { getPreviewIcons } from "../../utils/getPreviewIcons";
import { PreviewIcon } from "./PreviewIcon/PreviewIcon";

interface PreviewIconsProps {
  axes: AxisPair[];
  side: "start" | "end";
}

export const PreviewIcons = ({ axes, side }: PreviewIconsProps) => (
  <span
    data-testid={`multi-axis-chart-preview-${side}`}
    className={`flex h-4 min-w-0 flex-wrap overflow-hidden pl-1 ${side === "start" ? "justify-start" : "justify-end"}`}
  >
    {getPreviewIcons(axes, side).map((imageUrl, index) => (
      <PreviewIcon key={index} imageUrl={imageUrl} />
    ))}
  </span>
);
