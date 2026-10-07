import { useLingui } from "@lingui/react/macro";

import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import type { RankedComparison } from "@/types/results";
import { isNumber } from "@/utils/number/isNumber";
import { getComparisonEntry } from "@/utils/results/getComparisonEntry";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { ArchetypeEntry } from "../Archetype.types";
import { toRankedEntry } from "../utils/toRankedEntry";

interface ArchetypeLeaderProps {
  leader: ArchetypeEntry;
  isMatched: boolean;
  comparison?: RankedComparison;
}

export const ArchetypeLeader = ({
  leader,
  isMatched,
  comparison,
}: ArchetypeLeaderProps) => {
  const { t } = useLingui();
  const { orientation, value } = toRankedEntry(leader);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <h3
        data-testid="archetype-leader-name"
        className={`-my-[0.5px] min-h-5 min-w-0 truncate text-base leading-5 font-bold ${isMatched ? "text-gi-primary" : "text-gi-primary/50"}`}
      >
        {isMatched ? toSingleLine(orientation.name) : t`Brak dopasowania`}
      </h3>
      <UniversalAxis
        start={
          isMatched && isNumber(value) ? { orientation, value } : undefined
        }
        comparison={
          isMatched ? getComparisonEntry(comparison, orientation.id) : undefined
        }
        marker={false}
      />
    </div>
  );
};
