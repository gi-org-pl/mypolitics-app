import type { ResultEntry } from "@/types/results";

// Below every value, so that an entry without a value never leads.
const NO_VALUE = Number.NEGATIVE_INFINITY;

// The entry with the highest value, and of those that share it the one
// listed first. There is none when no entry has a value.
export const getTopEntry = (
  entries: readonly ResultEntry[],
): ResultEntry | undefined =>
  entries.reduce<ResultEntry | undefined>(
    (top, entry) =>
      (entry.value ?? NO_VALUE) > (top?.value ?? NO_VALUE) ? entry : top,
    undefined,
  );
