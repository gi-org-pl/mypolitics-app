import verifiedIcon from "@/assets/icons/verified.svg";
import type { RankedEntry } from "@/components/results/RankedRow/RankedRow.types";
import type { ResolvedRankedEntry } from "@/types/results";

import type { ModuleTexts } from "../ModuleDrawing.types";

// A row of a ranking. An official orientation carries the verified badge.
export const toRankedEntry = (
  { orientation, value, isOfficial }: ResolvedRankedEntry,
  { verifiedLabel }: ModuleTexts,
): RankedEntry => ({
  orientation,
  value,
  badge: isOfficial
    ? { iconUrl: verifiedIcon, label: verifiedLabel }
    : undefined,
});
