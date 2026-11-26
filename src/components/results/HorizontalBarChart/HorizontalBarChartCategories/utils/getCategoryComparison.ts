import type { RankedComparison } from "@/types/results";

import type { HorizontalBarComparison } from "../../HorizontalBarChart.types";

const NO_VALUES: Record<string, number> = {};

// The other party over the rows of one category. A comparison that carries
// values by category gives the category its own values, and none when it has
// none for it: a value of the whole result is never drawn inside a category.
// A comparison without them is used as it is, in every category.
export const getCategoryComparison = (
  comparison?: HorizontalBarComparison,
  categoryId?: string,
): RankedComparison | undefined => {
  if (!comparison?.categoryValues) return comparison;

  const { orientation, categoryValues } = comparison;
  const hasValues =
    typeof categoryId === "string" && Object.hasOwn(categoryValues, categoryId);

  return {
    orientation,
    values: hasValues ? categoryValues[categoryId] : NO_VALUES,
  };
};
