import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";

import type {
  NolanPosition,
  NolanQuadrant,
  NolanQuadrantKey,
} from "../NolanChart.types";

export interface NolanMapProps {
  description: string;
  horizontalName: string;
  verticalName: string;
  quadrants?: Partial<Record<NolanQuadrantKey, NolanQuadrant>>;
  position: NolanPosition | null;
  otherParty?: AxisOrientation;
  otherPosition: NolanPosition | null;
}
