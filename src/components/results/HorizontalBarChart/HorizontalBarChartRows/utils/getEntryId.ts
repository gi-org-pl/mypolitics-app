import type { RankedEntry } from "../../../RankedRow/RankedRow.types";

export const getEntryId = (entry: RankedEntry): string =>
  entry.orientation?.id ?? "";
