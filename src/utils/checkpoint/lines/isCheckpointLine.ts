import { CHECKPOINT_POOLS } from "@/constants/checkpoint";
import type { CheckpointLine, CheckpointPools } from "@/types/checkpoint";

// Whether a value is a line that exists: a pool the pools have, and a place
// in it that holds a line.
export const isCheckpointLine = (
  value: unknown,
  pools: CheckpointPools = CHECKPOINT_POOLS,
): value is CheckpointLine => {
  if (typeof value !== "object" || value === null) return false;

  const { pool, index } = value as Partial<
    Record<keyof CheckpointLine, unknown>
  >;

  return (
    typeof pool === "string" &&
    Object.hasOwn(pools, pool) &&
    Number.isInteger(index) &&
    Object.hasOwn(pools[pool as keyof CheckpointPools], String(index))
  );
};
