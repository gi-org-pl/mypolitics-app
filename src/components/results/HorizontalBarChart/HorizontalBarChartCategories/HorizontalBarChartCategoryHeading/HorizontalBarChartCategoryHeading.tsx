import { useLingui } from "@lingui/react/macro";

import type { RankedComparison } from "@/types/results";
import { getComparisonEntry } from "@/utils/results/getComparisonEntry";

import { RankedRow } from "../../../RankedRow/RankedRow";
import type { RankedEntry } from "../../../RankedRow/RankedRow.types";

interface HorizontalBarChartCategoryHeadingProps {
  name: string;
  leader: RankedEntry | null;
  comparison?: RankedComparison;
}

export const HorizontalBarChartCategoryHeading = ({
  name,
  leader,
  comparison,
}: HorizontalBarChartCategoryHeadingProps) => {
  const { t } = useLingui();

  return (
    <RankedRow
      isHeading
      prefix={name}
      entry={
        leader ?? {
          orientation: { id: "", type: "other", name: t`Brak wyniku` },
        }
      }
      comparison={
        leader
          ? getComparisonEntry(comparison, leader.orientation?.id)
          : undefined
      }
    />
  );
};
