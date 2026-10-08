import { CHECKPOINT_POOLS } from "@/constants/checkpoint";
import type {
  CheckpointLine,
  CheckpointPoolId,
  CheckpointPools,
  CheckpointRecord,
} from "@/types/checkpoint";

import { getUsedLineIndexes } from "./getUsedLineIndexes";
import { seededShuffle } from "./seededShuffle";

// The next unused line of the pool for this session, or nothing for a pool
// with no lines. Every pool has an order of its own: its lines shuffled by
// the seeded draw under the pool's name. What was used is counted from the
// record, so nothing is remembered here. A pool that is used up starts a new
// round with a new order, and the round never opens with the line used last.
export const drawCheckpointLine = (
  pool: CheckpointPoolId,
  record: Pick<CheckpointRecord, "cardsShown">,
  seed: string,
  pools: CheckpointPools = CHECKPOINT_POOLS,
): CheckpointLine | undefined => {
  const size = pools[pool]?.length ?? 0;

  if (size === 0) return undefined;

  const used = getUsedLineIndexes(record.cardsShown, pool);
  const round = Math.floor(used.length / size);
  const usedInRound = used.slice(round * size);
  // Only the first draw of a round can repeat the line before it.
  const usedLast = usedInRound.length === 0 && size > 1 ? used.at(-1) : null;
  const [index] = seededShuffle(
    Array.from({ length: size }, (_, place) => place),
    seed,
    pool,
    round,
  ).filter((place) => !usedInRound.includes(place) && place !== usedLast);

  return { pool, index };
};
