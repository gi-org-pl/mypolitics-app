import arrowsHorizontalIcon from "@/assets/icons/arrows-horizontal.svg";

import { formatCoordinate } from "../../utils/formatCoordinate";

interface AxisPillProps {
  side: "horizontal" | "vertical";
  name: string;
  coordinate?: number;
}

// The name of an axis of the map with the coordinate of the result on it. On
// the narrow card of a 320 px screen the map is 180 px, too short for a name
// such as the worldview axis of the identity quiz at the size of the type
// the design draws: there the pill takes the next size down and a tighter
// padding, so that the name is written in full. It is cut only when even
// that is not enough.
export const AxisPill = ({ side, name, coordinate }: AxisPillProps) => (
  <div
    data-testid={`nolan-chart-axis-${side}`}
    className={`flex [max-inline-size:100%] items-center gap-1.5 rounded-2xl bg-gi-ash p-2 text-base leading-4 font-bold whitespace-nowrap text-gi-primary @max-[16.5rem]:gap-1 @max-[16.5rem]:p-1.5 @max-[16.5rem]:text-sm ${
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
