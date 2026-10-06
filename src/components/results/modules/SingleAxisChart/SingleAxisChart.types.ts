import type {
  AxisEntry,
  AxisOrientation,
} from "@/components/shared/UniversalAxis/UniversalAxis.types";

export interface SingleAxisChartProps {
  orientation: AxisOrientation;
  value?: number;
  marker?: number | false;
  comparison?: AxisEntry;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
