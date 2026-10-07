import type { RankedComparison } from "@/types/results";
import { withKeys } from "@/utils/array/withKeys";
import { getComparisonEntry } from "@/utils/results/getComparisonEntry";

import { RankedRow } from "../../../RankedRow/RankedRow";
import type { ArchetypeEntry } from "../../Archetype.types";
import { toRankedEntry } from "../../utils/toRankedEntry";
import { getArchetypeId } from "./utils/getArchetypeId";

interface ArchetypeRankingProps {
  ranking: ArchetypeEntry[];
  comparison?: RankedComparison;
}

export const ArchetypeRanking = ({
  ranking,
  comparison,
}: ArchetypeRankingProps) => (
  <ol className="flex flex-col gap-4">
    {withKeys(ranking, getArchetypeId).map(({ item, key }) => (
      <li key={key}>
        <RankedRow
          entry={toRankedEntry(item)}
          comparison={getComparisonEntry(comparison, item.orientation?.id)}
        />
      </li>
    ))}
  </ol>
);
