import type { RankedComparison } from "@/types/results";

import type { RankedEntry } from "../RankedRow/RankedRow.types";

export interface RankedCategory {
  id?: string;
  name?: string;
  entries: RankedEntry[];
}

// The other party over a ranking: their value per orientation. For a list by
// category it can also carry their value inside each category.
export interface HorizontalBarComparison extends RankedComparison {
  // By category id, then by orientation id. When present, a category is drawn
  // with its own values only, never with the values of the whole result.
  categoryValues?: Record<string, Record<string, number>>;
}

export interface HorizontalBarChartProps {
  title?: string;
  entries?: RankedEntry[];
  categories?: RankedCategory[];
  visibleRows?: number;
  comparison?: HorizontalBarComparison;
  onStatsClick?: () => void;
  onInfoClick?: () => void;
}
