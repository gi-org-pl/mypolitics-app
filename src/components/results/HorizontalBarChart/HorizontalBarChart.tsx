import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";

import type { HorizontalBarChartProps } from "./HorizontalBarChart.types";
import { HorizontalBarChartCategories } from "./HorizontalBarChartCategories/HorizontalBarChartCategories";
import { HorizontalBarChartFlatList } from "./HorizontalBarChartFlatList/HorizontalBarChartFlatList";
import { sortRankedEntries } from "./utils/sortRankedEntries";

export const HorizontalBarChart = ({
  title,
  entries,
  categories,
  visibleRows,
  comparison,
  onStatsClick,
  onInfoClick,
}: HorizontalBarChartProps) => {
  const isGrouped = Array.isArray(categories);
  const ranking = isGrouped ? [] : sortRankedEntries(entries);

  return (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {isGrouped
        ? categories.length > 0 && (
            <HorizontalBarChartCategories
              categories={categories}
              comparison={comparison}
            />
          )
        : ranking.length > 0 && (
            <HorizontalBarChartFlatList
              ranking={ranking}
              visibleRows={visibleRows}
              comparison={comparison}
            />
          )}
    </ModuleWrapper>
  );
};
