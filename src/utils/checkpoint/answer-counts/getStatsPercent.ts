import { STATS_MIN_PERCENT, WHOLE_PERCENT } from "@/constants/checkpoint";
import type { StatsCheckpointCard } from "@/types/checkpoint";

// The percent a stats card prints for the taker's side: the share of that
// side among everyone the question was shown to, rounded up and never below
// 1. The trigger writes it and the store of the tab checks it, so the two
// cannot drift apart.
export const getStatsPercent = (
  counts: StatsCheckpointCard["counts"],
  side: StatsCheckpointCard["side"],
): number =>
  Math.max(
    STATS_MIN_PERCENT,
    Math.ceil(
      (counts[side] * WHOLE_PERCENT) /
        (counts.for + counts.against + counts.noAnswer),
    ),
  );
