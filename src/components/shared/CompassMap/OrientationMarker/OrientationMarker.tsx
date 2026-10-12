import { Avatar } from "@gi-org-pl/athena";

import { HATCH_CLASS_NAME } from "@/constants/hatch";
import type { Orientation } from "@/types/orientation";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { getNolanColorStyle } from "@/utils/style/getNolanColorStyle";

import { MAP_CLIP_CLASS_NAME } from "../CompassMap.constants";
import type { CompassMapPoint } from "../CompassMap.types";
import { getPositionStyle } from "../utils/getPositionStyle";

interface OrientationMarkerProps {
  orientation?: Orientation;
  position: CompassMapPoint;
}

export const OrientationMarker = ({
  orientation,
  position,
}: OrientationMarkerProps) => {
  const color = getSafeColor(orientation?.color);
  const imageClassName = `size-6 rounded-full border-2 border-gi-primary ${color ? "bg-(--nolan-color)" : "bg-gi-dark-gray"}`;
  const imageStyle = getNolanColorStyle(color);

  return (
    <div className={MAP_CLIP_CLASS_NAME}>
      <div
        data-testid="nolan-chart-comparison"
        className={`absolute top-[clamp(14px,var(--nolan-y),calc(100%-14px))] left-[clamp(14px,var(--nolan-x),calc(100%-14px))] flex size-14 -translate-1/2 items-center justify-center rounded-full ${HATCH_CLASS_NAME}`}
        style={getPositionStyle(position)}
      >
        {orientation?.imageUrl ? (
          <Avatar
            size="small"
            src={orientation.imageUrl}
            dataTestId="nolan-chart-comparison-image"
            className={imageClassName}
            style={imageStyle}
          />
        ) : (
          <div
            data-testid="nolan-chart-comparison-image"
            className={imageClassName}
            style={imageStyle}
          />
        )}
      </div>
    </div>
  );
};
