import type { ResultEntry } from "@/types/results";

import { toNumbersByKey } from "@/utils/number/toNumbersByKey";

// The values of the entries of a module, by orientation.
export const toEntryValues = (
  entries: readonly ResultEntry[],
): Record<string, number> =>
  toNumbersByKey(
    entries.map(({ orientation, value }) => [orientation.id, value]),
  );
