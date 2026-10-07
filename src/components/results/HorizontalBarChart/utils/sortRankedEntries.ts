import { getRankedValue } from "@/utils/results/getRankedValue";
import { isOrientationShown } from "@/utils/results/isOrientationShown";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";

const ABSENT_VALUE_RANK = -1;

export const sortRankedEntries = (entries?: RankedEntry[]): RankedEntry[] => {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        isOrientationShown(entry.orientation),
    )
    .map((entry, index) => ({ entry, index, value: getRankedValue(entry) }))
    .sort(
      (first, second) =>
        (second.value ?? ABSENT_VALUE_RANK) -
          (first.value ?? ABSENT_VALUE_RANK) || first.index - second.index,
    )
    .map(({ entry }) => entry);
};
