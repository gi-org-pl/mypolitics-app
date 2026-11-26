import type { RankedComparison } from "@/types/results";
import { withKeys } from "@/utils/array/withKeys";
import { getComparisonEntry } from "@/utils/results/getComparisonEntry";

import { RankedRow } from "../../RankedRow/RankedRow";
import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import { getEntryId } from "./utils/getEntryId";
import { hasBars } from "./utils/hasBars";

interface HorizontalBarChartRowsProps {
  ranking: RankedEntry[];
  comparison?: RankedComparison;
}

// The rows of a ranking, with bars or - for a ranking with no values - as a
// list of names. The entries come sorted by value, so the rows that show
// before a fold have a value whenever any entry has one.
export const HorizontalBarChartRows = ({
  ranking,
  comparison,
}: HorizontalBarChartRowsProps) => {
  const isRanked = hasBars(ranking, comparison);

  return withKeys(ranking, getEntryId).map(({ item, key }) => (
    <li key={key}>
      <RankedRow
        entry={item}
        comparison={getComparisonEntry(comparison, item.orientation?.id)}
        hasBar={isRanked}
      />
    </li>
  ));
};
