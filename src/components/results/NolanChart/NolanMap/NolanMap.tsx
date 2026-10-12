import { CompassMap } from "@/components/shared/CompassMap/CompassMap";
import type { Orientation } from "@/types/orientation";
import type { NolanPosition } from "@/types/results";

import type { NolanQuadrants } from "../NolanChart.types";
import { AxisPill } from "./AxisPill/AxisPill";

interface NolanMapProps {
  description: string;
  horizontalName: string;
  verticalName: string;
  quadrants?: Partial<NolanQuadrants>;
  position: NolanPosition | null;
  otherOrientation?: Orientation;
  otherPosition: NolanPosition | null;
}

// The map of the result's Nolan chart with the names of its two axes beside
// it. The map itself is `CompassMap`; the image and its description are this
// element's, because the axis names and coordinates belong to the picture.
export const NolanMap = ({
  description,
  horizontalName,
  verticalName,
  quadrants,
  position,
  otherOrientation,
  otherPosition,
}: NolanMapProps) => (
  <div
    role="img"
    aria-label={description}
    className="flex w-full min-w-0 flex-col gap-3"
  >
    <div className="flex min-w-0 gap-3">
      <div className="min-w-0 flex-1">
        <CompassMap
          quadrants={quadrants}
          position={position}
          otherOrientation={otherOrientation}
          otherPosition={otherPosition}
        />
      </div>
      <div className="relative w-8 shrink-0">
        <AxisPill
          side="vertical"
          name={verticalName}
          coordinate={position?.y}
        />
      </div>
    </div>
    <div className="mr-11 flex min-w-0 justify-center">
      <AxisPill
        side="horizontal"
        name={horizontalName}
        coordinate={position?.x}
      />
    </div>
  </div>
);
