import type { AxisEntry } from "@/types/axis";
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
