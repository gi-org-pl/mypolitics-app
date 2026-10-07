import { withKeys } from "@/utils/array/withKeys";

import type { RankedCategory } from "../../HorizontalBarChart.types";
import type { CategoryItem } from "../HorizontalBarChartCategories.types";
import { getCategoryIdentity } from "./getCategoryIdentity";
import { getCategoryRanking } from "./getCategoryRanking";

export const getCategoryItems = (
  categories: RankedCategory[],
): CategoryItem[] =>
  withKeys(categories, getCategoryIdentity).map(({ item, key }) => ({
    key,
    ...getCategoryRanking(item),
  }));
