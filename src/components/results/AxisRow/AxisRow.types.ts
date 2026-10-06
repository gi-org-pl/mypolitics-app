import type { AxisEntry } from "@/components/shared/UniversalAxis/UniversalAxis.types";
import type { ResultEntry } from "@/types/results";

export interface AxisRowProps {
  name?: string;
  leadName?: string;
  start: ResultEntry;
  end: ResultEntry;
  marker?: number | false;
  showLabels?: boolean;
  comparison?: AxisEntry;
}
