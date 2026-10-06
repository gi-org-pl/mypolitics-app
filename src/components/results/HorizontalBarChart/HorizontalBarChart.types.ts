import type { RankedComparison } from "@/types/results";

import type { RankedEntry } from "../RankedRow/RankedRow.types";

export interface RankedCategory {
  id?: string;
  name?: string;
  entries: RankedEntry[];
}

export interface HorizontalBarChartProps {
  title?: string;
  entries?: RankedEntry[];
  categories?: RankedCategory[];
  visibleRows?: number;
  comparison?: RankedComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
