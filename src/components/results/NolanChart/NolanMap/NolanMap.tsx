import type { AxisOrientation } from "@/types/axis";

import type { NolanPosition, NolanQuadrants } from "../NolanChart.types";
import { AxisPill } from "./AxisPill/AxisPill";
import { PartyMarker } from "./PartyMarker/PartyMarker";
import { QuadrantGrid } from "./QuadrantGrid/QuadrantGrid";
import { TakerDot } from "./TakerDot/TakerDot";

interface NolanMapProps {
  description: string;
  horizontalName: string;
  verticalName: string;
  quadrants?: Partial<NolanQuadrants>;
  position: NolanPosition | null;
  otherParty?: AxisOrientation;
  otherPosition: NolanPosition | null;
}

export const NolanMap = ({
  description,
  horizontalName,
  verticalName,
  quadrants,
  position,
  otherParty,
  otherPosition,
}: NolanMapProps) => (
  <div
    role="img"
    aria-label={description}
    className="flex w-full min-w-0 flex-col gap-3"
  >
    <div className="flex min-w-0 gap-3">
      <div
        data-testid="nolan-chart-map"
        className="relative aspect-square min-w-0 flex-1 rounded-xl bg-white"
      >
        <QuadrantGrid
          quadrants={quadrants}
          filledQuadrant={
            position && position.level !== "centre" ? position.quadrant : null
          }
        />
        {position && <TakerDot position={position} />}
        {otherPosition && (
          <PartyMarker party={otherParty} position={otherPosition} />
        )}
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
