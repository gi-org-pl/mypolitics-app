import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";

import { toSingleLine } from "@/utils/text/toSingleLine";

import type { HorizontalBarChartProps } from "./HorizontalBarChart.types";
import { HorizontalBarChartCategories } from "./HorizontalBarChartCategories/HorizontalBarChartCategories";
import { HorizontalBarChartEmpty } from "./HorizontalBarChartEmpty/HorizontalBarChartEmpty";
import { HorizontalBarChartFlatList } from "./HorizontalBarChartFlatList/HorizontalBarChartFlatList";
import { sortRankedEntries } from "./utils/sortRankedEntries";

export const HorizontalBarChart = ({
  title,
  entries,
  categories,
  visibleRows,
  emptyLabel,
  comparison,
  onStatsClick,
  onInfoClick,
}: HorizontalBarChartProps) => {
  const isGrouped = Array.isArray(categories);
  const ranking = isGrouped ? [] : sortRankedEntries(entries);
  const emptyText = toSingleLine(emptyLabel);

  return (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {isGrouped ? (
        categories.length > 0 && (
          <HorizontalBarChartCategories
            categories={categories}
            comparison={comparison}
          />
        )
      ) : ranking.length > 0 ? (
        <HorizontalBarChartFlatList
          ranking={ranking}
          visibleRows={visibleRows}
          comparison={comparison}
        />
      ) : (
        emptyText !== "" && <HorizontalBarChartEmpty text={emptyText} />
      )}
    </ModuleWrapper>
  );
};
