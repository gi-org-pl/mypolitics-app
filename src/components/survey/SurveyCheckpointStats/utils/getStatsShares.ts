import { WHOLE_PERCENT } from "@/constants/checkpoint";
import type { StatsCheckpointCard } from "@/types/checkpoint";
import { getShares } from "@/utils/number/getShares";

import { STATS_SLICE_IDS } from "../SurveyCheckpointStats.constants";
import type { StatsShares } from "../SurveyCheckpointStats.types";

// The three slices as whole percents of the three counts together, for the
// description of the pie. The taker's side reads the percent of the card, so
// the description and the statement give the same number; the other two are
// rounded to the nearest whole percent, and the three need not add up to a
// hundred. Nothing when the counts cannot be drawn.
export const getStatsShares = (
  card: StatsCheckpointCard,
): StatsShares | undefined => {
  const shares = getShares(STATS_SLICE_IDS.map((id) => card.counts?.[id]));

  if (!shares) return undefined;

  const [forPercent, againstPercent, noAnswerPercent] = shares.map((share) =>
    Math.round(share * WHOLE_PERCENT),
  );

  return {
    for: forPercent,
    against: againstPercent,
    noAnswer: noAnswerPercent,
    [card.side]: card.percent,
  };
};
