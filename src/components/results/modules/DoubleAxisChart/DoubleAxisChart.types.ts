import type { AxisEntry } from "@/components/shared/UniversalAxis/UniversalAxis.types";
import type { ResultEntry } from "@/types/results";

export interface DoubleAxisChartProps {
  start: ResultEntry;
  end: ResultEntry;
  marker?: number | false;
  comparison?: AxisEntry;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
