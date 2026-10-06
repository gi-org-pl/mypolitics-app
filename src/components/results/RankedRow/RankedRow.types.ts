import type {
  AxisEntry,
  AxisOrientation,
} from "@/components/shared/UniversalAxis/UniversalAxis.types";

export interface RankedBadge {
  iconUrl?: string;
  text?: string;
  label?: string;
}

export interface RankedEntry {
  orientation: AxisOrientation;
  value?: number;
  badge?: RankedBadge;
}

export interface RankedRowProps {
  entry: RankedEntry;
  comparison?: AxisEntry;
  prefix?: string;
  isHeading?: boolean;
}
