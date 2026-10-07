import type { RankedComparison } from "@/types/results";
import { withKeys } from "@/utils/array/withKeys";
import { getComparisonEntry } from "@/utils/results/getComparisonEntry";

import { RankedRow } from "../../RankedRow/RankedRow";
import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import { getEntryId } from "./utils/getEntryId";

interface HorizontalBarChartRowsProps {
  ranking: RankedEntry[];
  comparison?: RankedComparison;
}

export const HorizontalBarChartRows = ({
  ranking,
  comparison,
}: HorizontalBarChartRowsProps) =>
  withKeys(ranking, getEntryId).map(({ item, key }) => (
    <li key={key}>
      <RankedRow
        entry={item}
        comparison={getComparisonEntry(comparison, item.orientation?.id)}
      />
    </li>
  ));
