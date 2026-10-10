import { useLingui } from "@lingui/react/macro";

import type { StatsCheckpointCard } from "@/types/checkpoint";

import { STATS_SLICE_IDS } from "../SurveyCheckpointStats.constants";
import { getStatsShares } from "./getStatsShares";
import { useStatsSliceNames } from "./useStatsSliceNames";

const SEPARATOR = ", ";

// The pie in words, in the active language: the three slices with their
// shares, in the order of the legend - "Za: 10%, Przeciw: 60%, Brak
// odpowiedzi: 30%". Nothing when the counts cannot be drawn.
export const useStatsDescription = (
  card: StatsCheckpointCard,
): string | undefined => {
  const { t } = useLingui();
  const names = useStatsSliceNames();
  const shares = getStatsShares(card);

  return shares
    ? STATS_SLICE_IDS.map((id) => {
        const name = names[id];
        const percent = shares[id];

        return t`${name}: ${percent}%`;
      }).join(SEPARATOR)
    : undefined;
};
