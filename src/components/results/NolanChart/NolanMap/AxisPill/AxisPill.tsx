import arrowsHorizontalIcon from "@/assets/icons/arrows-horizontal.svg";

import { formatCoordinate } from "../../utils/formatCoordinate";

interface AxisPillProps {
  side: "horizontal" | "vertical";
  name: string;
  coordinate?: number;
}

export const AxisPill = ({ side, name, coordinate }: AxisPillProps) => (
  <div
    data-testid={`nolan-chart-axis-${side}`}
    className={`flex [max-inline-size:100%] items-center gap-1.5 rounded-2xl bg-gi-ash p-2 text-base leading-4 font-bold whitespace-nowrap text-gi-primary ${
      side === "vertical"
        ? "absolute top-1/2 left-0 -translate-y-1/2 [writing-mode:vertical-rl]"
        : ""
    }`}
  >
    <span className="flex size-4 shrink-0 items-center justify-center">
      <img
        src={arrowsHorizontalIcon}
        alt=""
        className={side === "vertical" ? "rotate-90" : ""}
      />
    </span>
    {name && (
      <span className="[min-inline-size:0] truncate [block-size:1rem]">
        {name}
      </span>
    )}
    {coordinate !== undefined && (
      <>
        <span className="shrink-0 bg-gi-primary/10 [block-size:1rem] [inline-size:1px]" />
        <span
          data-testid={`nolan-chart-coordinate-${side}`}
          className="shrink-0 text-gi-primary/50"
        >
          {formatCoordinate(coordinate)}
        </span>
      </>
    )}
  </div>
);
