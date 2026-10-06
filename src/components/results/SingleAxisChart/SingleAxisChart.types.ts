import type { AxisEntry, AxisOrientation } from "@/types/axis";

export interface SingleAxisChartProps {
  orientation: AxisOrientation;
  value?: number;
  marker?: number | false;
  comparison?: AxisEntry;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
