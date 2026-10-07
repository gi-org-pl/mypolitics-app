import type { Orientation } from "@/types/orientation";
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
  orientation: Orientation;
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
