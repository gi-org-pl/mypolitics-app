import type { RankedComparison } from "@/types/results";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";

export interface CategoryRanking {
  name: string;
  ranking: RankedEntry[];
  leader: RankedEntry | null;
  rest: RankedEntry[];
}

export interface CategoryItem extends CategoryRanking {
  key: string;
  comparison?: RankedComparison; // the other party over the rows of this category
}
