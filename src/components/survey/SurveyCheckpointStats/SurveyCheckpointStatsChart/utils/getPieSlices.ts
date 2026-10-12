import type { StatsCheckpointCard } from "@/types/checkpoint";
import { getShares } from "@/utils/number/getShares";

import {
  MIN_SLICE_SHARE,
  STATS_SLICE_IDS,
} from "../../SurveyCheckpointStats.constants";
import type { StatsSlice } from "../../SurveyCheckpointStats.types";

// The slices of the pie: one per count above zero, in the order for, against,
// no answer, each from where the one before it ends, and together the whole
// circle. A slice is sized by its count; one that would be thinner than the
// smallest share is drawn at that share, and what it gains is taken from the
// others by what each has to spare. No slice when a count is negative or not
// a number, and when the three are all zero.
export const getPieSlices = (
  counts: StatsCheckpointCard["counts"],
): StatsSlice[] => {
  const shares = getShares(STATS_SLICE_IDS.map((id) => counts?.[id])) ?? [];
  const drawn = STATS_SLICE_IDS.map((id, index) => ({
    id,
    share: shares[index] ?? 0,
  })).filter(({ share }) => share > 0);
  const missing = drawn.reduce(
    (total, { share }) => total + Math.max(0, MIN_SLICE_SHARE - share),
    0,
  );
  const spare = drawn.reduce(
    (total, { share }) => total + Math.max(0, share - MIN_SLICE_SHARE),
    0,
  );

  return drawn.reduce<StatsSlice[]>((slices, { id, share }, index) => {
    const from = slices.at(-1)?.to ?? 0;
    // The shares add up to one, so there is always a slice with some to spare.
    const size =
      share < MIN_SLICE_SHARE
        ? MIN_SLICE_SHARE
        : share - (missing * (share - MIN_SLICE_SHARE)) / spare;

    // The last slice closes the circle exactly, whatever the sums left over.
    return [
      ...slices,
      { id, from, to: index === drawn.length - 1 ? 1 : from + size },
    ];
  }, []);
};
