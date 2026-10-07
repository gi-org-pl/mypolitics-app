import { useState } from "react";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";
import { getVisibleRows } from "./getVisibleRows";

interface FoldedRanking {
  rows: RankedEntry[];
  hasFold: boolean;
  isFolded: boolean;
  toggle: () => void;
}

export const useFoldedRanking = (
  ranking: RankedEntry[],
  visibleRows?: number,
): FoldedRanking => {
  const [isOpen, setIsOpen] = useState(false);

  const limit = getVisibleRows(visibleRows);
  const hasFold = ranking.length > limit;
  const isFolded = hasFold && !isOpen;

  return {
    rows: isFolded ? ranking.slice(0, limit) : ranking,
    hasFold,
    isFolded,
    toggle: () => setIsOpen(isFolded),
  };
};
