import type { AxisPair } from "../../MultiAxisChart.types";
import { getPreviewIcons } from "../../utils/getPreviewIcons";

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
      <span
        key={index}
        className="-ml-1 size-4 shrink-0 rounded-full bg-white ring-1 ring-gi-ash ring-inset"
      >
        <img
          src={imageUrl}
          alt=""
          className="size-4 object-cover opacity-40 brightness-0"
        />
      </span>
    ))}
  </span>
);
