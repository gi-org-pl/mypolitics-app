import { Avatar } from "@gi-org-pl/athena";
import type { CSSProperties } from "react";

import arrowsHorizontalIcon from "@/assets/icons/arrows-horizontal.svg";
import { HATCH_CLASS_NAME } from "@/constants/hatch";
import { getSafeColor } from "@/utils/color/getSafeColor";

import { QUADRANT_KEYS } from "../NolanChart.constants";
import type { NolanPosition } from "../NolanChart.types";
import { formatCoordinate } from "../utils/formatCoordinate";
import type { NolanMapProps } from "./NolanMap.types";

const MARKER_CLASS_NAME =
  "absolute flex size-14 -translate-1/2 items-center justify-center rounded-full";
const DIVIDER_CLASS_NAME = "absolute bg-gi-dark-ash";

const toPercent = (share: number): string => `${share * 100}%`;

const getPositionStyle = ({ x, y }: NolanPosition): CSSProperties =>
  ({
    "--nolan-x": toPercent((x + 1) / 2),
    "--nolan-y": toPercent((1 - y) / 2),
  }) as CSSProperties;

const renderPill = (
  side: "horizontal" | "vertical",
  name: string,
  coordinate?: number,
) => (
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

export const NolanMap = ({
  description,
  horizontalName,
  verticalName,
  quadrants,
  position,
  otherParty,
  otherPosition,
}: NolanMapProps) => {
  const filledQuadrant =
    position && position.level !== "centre" ? position.quadrant : null;
  const otherColor = getSafeColor(otherParty?.color);
  const otherImageClassName = `size-6 rounded-full border-2 border-gi-primary ${otherColor ? "bg-(--nolan-color)" : "bg-gi-dark-gray"}`;
  const otherImageStyle = otherColor
    ? ({ "--nolan-color": otherColor } as CSSProperties)
    : undefined;

  return (
    <div
      role="img"
      aria-label={description}
      className="flex w-full min-w-0 flex-col gap-3"
    >
      <div className="flex min-w-0 gap-3">
        <div
          data-testid="nolan-chart-map"
          className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-xl bg-white"
        >
          <div className="grid size-full grid-cols-2 grid-rows-2">
            {QUADRANT_KEYS.map((key) => {
              const color = getSafeColor(quadrants?.[key]?.color);
              const isFilled = key === filledQuadrant;
              const tintClassName = color
                ? "bg-(--nolan-color)/10"
                : "bg-gi-dark-gray/10";
              const fillClassName = color
                ? "bg-(--nolan-color)"
                : "bg-gi-dark-gray";

              return (
                <div
                  key={key}
                  data-testid={`nolan-chart-quadrant-${key}`}
                  data-filled={isFilled}
                  className={isFilled ? fillClassName : tintClassName}
                  style={
                    color
                      ? ({ "--nolan-color": color } as CSSProperties)
                      : undefined
                  }
                />
              );
            })}
          </div>
          <div
            className={`${DIVIDER_CLASS_NAME} inset-y-0 left-1/2 w-0.5 -translate-x-1/2`}
          />
          <div
            className={`${DIVIDER_CLASS_NAME} inset-x-0 top-1/2 h-0.5 -translate-y-1/2`}
          />
          <div className="absolute inset-0 rounded-xl border-2 border-gi-dark-ash" />
          {position && (
            <div
              data-testid="nolan-chart-dot"
              className={`${MARKER_CLASS_NAME} top-(--nolan-y) left-(--nolan-x) bg-gi-primary/25`}
              style={getPositionStyle(position)}
            >
              <div className="size-6 rounded-full border-2 border-gi-primary bg-gi-light-primary" />
            </div>
          )}
          {otherPosition && (
            <div
              data-testid="nolan-chart-comparison"
              className={`${MARKER_CLASS_NAME} top-[clamp(14px,var(--nolan-y),calc(100%-14px))] left-[clamp(14px,var(--nolan-x),calc(100%-14px))] ${HATCH_CLASS_NAME}`}
              style={getPositionStyle(otherPosition)}
            >
              {otherParty?.imageUrl ? (
                <Avatar
                  size="small"
                  src={otherParty.imageUrl}
                  dataTestId="nolan-chart-comparison-image"
                  className={otherImageClassName}
                  style={otherImageStyle}
                />
              ) : (
                <div
                  data-testid="nolan-chart-comparison-image"
                  className={otherImageClassName}
                  style={otherImageStyle}
                />
              )}
            </div>
          )}
        </div>
        <div className="relative w-8 shrink-0">
          {renderPill("vertical", verticalName, position?.y)}
        </div>
      </div>
      <div className="mr-11 flex min-w-0 justify-center">
        {renderPill("horizontal", horizontalName, position?.x)}
      </div>
    </div>
  );
};
