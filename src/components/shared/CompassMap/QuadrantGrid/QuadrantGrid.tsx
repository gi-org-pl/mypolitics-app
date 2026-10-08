import type { NolanQuadrantKey } from "@/types/results";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { getNolanColorStyle } from "@/utils/style/getNolanColorStyle";

import { MAP_CLIP_CLASS_NAME, QUADRANT_KEYS } from "../CompassMap.constants";
import type { CompassMapQuadrants } from "../CompassMap.types";

const DIVIDER_CLASS_NAME = "absolute bg-gi-dark-ash";

interface QuadrantGridProps {
  quadrants?: CompassMapQuadrants;
  filledQuadrant?: NolanQuadrantKey | null;
}

export const QuadrantGrid = ({
  quadrants,
  filledQuadrant,
}: QuadrantGridProps) => (
  <div className={MAP_CLIP_CLASS_NAME}>
    <div className="grid size-full grid-cols-2 grid-rows-2">
      {QUADRANT_KEYS.map((key) => {
        const color = getSafeColor(quadrants?.[key]?.color);
        const isFilled = key === filledQuadrant;
        const tintClassName = color
          ? "bg-(--nolan-color)/10"
          : "bg-gi-dark-gray/10";
        const fillClassName = color ? "bg-(--nolan-color)" : "bg-gi-dark-gray";

        return (
          <div
            key={key}
            data-testid={`nolan-chart-quadrant-${key}`}
            data-filled={isFilled}
            className={isFilled ? fillClassName : tintClassName}
            style={getNolanColorStyle(color)}
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
  </div>
);
