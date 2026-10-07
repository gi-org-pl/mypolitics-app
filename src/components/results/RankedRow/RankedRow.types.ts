import type { AxisEntry } from "@/types/axis";
import type { Orientation } from "@/types/orientation";

export interface RankedBadge {
  iconUrl?: string;
  text?: string;
  label?: string;
}

export interface RankedEntry {
  orientation: Orientation;
  value?: number;
  badge?: RankedBadge;
}

export interface RankedRowProps {
  entry: RankedEntry;
  comparison?: AxisEntry;
  prefix?: string;
  isHeading?: boolean;
}
