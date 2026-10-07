import { Avatar } from "@gi-org-pl/athena";

import { HATCH_CLASS_NAME } from "@/constants/hatch";
import type { AxisOrientation } from "@/types/axis";
import { getSafeColor } from "@/utils/color/getSafeColor";

import { MAP_CLIP_CLASS_NAME } from "../../NolanChart.constants";
import type { NolanPosition } from "../../NolanChart.types";
import { getColorStyle } from "../../utils/getColorStyle";
import { getPositionStyle } from "../../utils/getPositionStyle";

interface PartyMarkerProps {
  party?: AxisOrientation;
  position: NolanPosition;
}

export const PartyMarker = ({ party, position }: PartyMarkerProps) => {
  const color = getSafeColor(party?.color);
  const imageClassName = `size-6 rounded-full border-2 border-gi-primary ${color ? "bg-(--nolan-color)" : "bg-gi-dark-gray"}`;
  const imageStyle = getColorStyle(color);

  return (
    <div className={MAP_CLIP_CLASS_NAME}>
      <div
        data-testid="nolan-chart-comparison"
        className={`absolute top-[clamp(14px,var(--nolan-y),calc(100%-14px))] left-[clamp(14px,var(--nolan-x),calc(100%-14px))] flex size-14 -translate-1/2 items-center justify-center rounded-full ${HATCH_CLASS_NAME}`}
        style={getPositionStyle(position)}
      >
        {party?.imageUrl ? (
          <Avatar
            size="small"
            src={party.imageUrl}
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
