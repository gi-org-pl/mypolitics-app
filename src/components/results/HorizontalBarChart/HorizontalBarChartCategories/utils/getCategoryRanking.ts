import { getRankedValue } from "@/utils/results/getRankedValue";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { RankedCategory } from "../../HorizontalBarChart.types";
import { sortRankedEntries } from "../../utils/sortRankedEntries";
import type { CategoryRanking } from "../HorizontalBarChartCategories.types";

export const getCategoryRanking = (
  category?: RankedCategory,
): CategoryRanking => {
  const ranking = sortRankedEntries(category?.entries);
  const [first] = ranking;
  const hasResult = (getRankedValue(first) ?? 0) > 0;

  return {
    name: toSingleLine(category?.name),
    ranking,
    leader: hasResult ? first : null,
    rest: hasResult ? ranking.slice(1) : ranking,
  };
};
