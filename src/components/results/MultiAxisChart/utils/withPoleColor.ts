import type { ResultEntry } from "@/types/results";
import { getSafeColor } from "@/utils/color/getSafeColor";

// A pole in a colour it is lent: one that has a colour of its own keeps it,
// and one with no orientation, or lent nothing, stays as it is.
export const withPoleColor = (
  entry: ResultEntry,
  color?: string,
): ResultEntry =>
  entry?.orientation && !getSafeColor(entry.orientation.color) && color
    ? { ...entry, orientation: { ...entry.orientation, color } }
    : entry;
