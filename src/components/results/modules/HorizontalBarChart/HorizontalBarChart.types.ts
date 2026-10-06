import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";

import type { RankedEntry } from "../RankedRow/RankedRow.types";

export type { RankedBadge, RankedEntry } from "../RankedRow/RankedRow.types";

export interface RankedCategory {
  name?: string;
  entries: RankedEntry[];
}

export interface RankedComparison {
  party: AxisOrientation;
  values: Record<string, number>;
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
