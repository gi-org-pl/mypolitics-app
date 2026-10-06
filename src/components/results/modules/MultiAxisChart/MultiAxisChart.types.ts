import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";
import type { ResultEntry } from "@/types/results";

export interface AxisPair {
  id: string;
  start: ResultEntry;
  end: ResultEntry;
}

export interface AxisGroup {
  name?: string;
  axes: AxisPair[];
}

export interface AxisComparison {
  party: AxisOrientation;
  values: Record<string, number>;
}

export interface MultiAxisChartProps {
  title?: string;
  groups: AxisGroup[];
  marker?: number | false;
  comparison?: AxisComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
