import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";

export interface SingleAxisChartProps {
  orientation: Orientation;
  value?: number;
  marker?: number | false;
  comparison?: AxisEntry;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
