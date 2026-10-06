import { toSingleLine } from "@/utils/text/toSingleLine";

import type { ArchetypeEntry } from "../../../Archetype.types";
import { PREVIEW_IMAGES } from "../ArchetypeRankingPreview.constants";

export const getPreviewImages = (ranking: ArchetypeEntry[]): string[] =>
  ranking
    .map(({ orientation }) => toSingleLine(orientation?.imageUrl))
    .filter((imageUrl) => imageUrl !== "")
    .slice(0, PREVIEW_IMAGES);
