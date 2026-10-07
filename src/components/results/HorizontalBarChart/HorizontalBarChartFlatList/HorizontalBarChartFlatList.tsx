import { useLingui } from "@lingui/react/macro";

import type { RankedComparison } from "@/types/results";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import { HorizontalBarChartControl } from "../HorizontalBarChartControl/HorizontalBarChartControl";
import { HorizontalBarChartRows } from "../HorizontalBarChartRows/HorizontalBarChartRows";
import { useFoldedRanking } from "./utils/useFoldedRanking";

interface HorizontalBarChartFlatListProps {
  ranking: RankedEntry[];
  visibleRows?: number;
  comparison?: RankedComparison;
}

export const HorizontalBarChartFlatList = ({
  ranking,
  visibleRows,
  comparison,
}: HorizontalBarChartFlatListProps) => {
  const { t } = useLingui();
  const { rows, hasFold, isFolded, toggle } = useFoldedRanking(
    ranking,
    visibleRows,
  );

  return (
    <div className="flex flex-col gap-4">
      <ol className="flex flex-col gap-2">
        <HorizontalBarChartRows ranking={rows} comparison={comparison} />
      </ol>
      {hasFold && (
        <div className="-mx-4 -mb-4 flex">
          <HorizontalBarChartControl
            label={isFolded ? t`Pokaż wszystkie` : t`Pokaż mniej`}
            isExpanded={!isFolded}
            isQuiet={isFolded}
            onClick={toggle}
          />
        </div>
      )}
    </div>
  );
};
