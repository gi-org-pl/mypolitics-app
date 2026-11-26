import { withKeys } from "@/utils/array/withKeys";

import type {
  HorizontalBarComparison,
  RankedCategory,
} from "../../HorizontalBarChart.types";
import type { CategoryItem } from "../HorizontalBarChartCategories.types";
import { getCategoryComparison } from "./getCategoryComparison";
import { getCategoryIdentity } from "./getCategoryIdentity";
import { getCategoryRanking } from "./getCategoryRanking";

// The categories as the list draws them: each with its key, its ranking, and
// the other party over its rows.
export const getCategoryItems = (
  categories: RankedCategory[],
  comparison?: HorizontalBarComparison,
): CategoryItem[] =>
  withKeys(categories, getCategoryIdentity).map(({ item, key }) => ({
    key,
    ...getCategoryRanking(item),
    comparison: getCategoryComparison(comparison, item?.id),
  }));
