import {
  MAX_AXIS_VALUE,
  MIN_AXIS_VALUE,
} from "@/components/shared/UniversalAxis/UniversalAxis.constants";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";

export const getRankedValue = (entry?: RankedEntry): number | null => {
  const value = entry?.value;

  if (typeof value !== "number" || Number.isNaN(value)) return null;

  return Math.min(MAX_AXIS_VALUE, Math.max(MIN_AXIS_VALUE, value));
};

export const sortRankedEntries = (entries?: RankedEntry[]): RankedEntry[] => {
  if (!Array.isArray(entries)) return [];

  return entries
    .filter((entry) => typeof entry === "object" && entry !== null)
    .map((entry, index) => ({ entry, index, value: getRankedValue(entry) }))
    .sort(
      (first, second) =>
        (second.value ?? -1) - (first.value ?? -1) ||
        first.index - second.index,
    )
    .map(({ entry }) => entry);
};
