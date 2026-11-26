import type { HorizontalBarChartProps } from "@/components/results/HorizontalBarChart/HorizontalBarChart.types";

import type { ModuleTexts, ResolvedModuleOf } from "../../ModuleDrawing.types";
import { toRankedEntry } from "./toRankedEntry";

// A ranking is one list, or one list per category when its record groups by
// category.
export const toHorizontalBarProps = (
  module: ResolvedModuleOf<"horizontal_bar">,
  texts: ModuleTexts,
): HorizontalBarChartProps => ({
  title: module.title,
  visibleRows: module.visibleRows,
  ...("categories" in module
    ? {
        categories: module.categories.map(({ id, name, entries }) => ({
          id,
          name,
          entries: entries.map((entry) => toRankedEntry(entry, texts)),
        })),
      }
    : { entries: module.entries.map((entry) => toRankedEntry(entry, texts)) }),
});
