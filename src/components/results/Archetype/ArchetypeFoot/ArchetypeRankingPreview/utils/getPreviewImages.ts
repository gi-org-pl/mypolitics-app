import { toSingleLine } from "@/utils/text/toSingleLine";

import type { ArchetypeEntry } from "../../../Archetype.types";
import { PREVIEW_IMAGES } from "../ArchetypeRankingPreview.constants";

// An address that failed to load counts as no address: the entry is skipped
// before the preview is cut, so the next one with an image takes its place.
export const getPreviewImages = (
  ranking: ArchetypeEntry[],
  failedUrls: string[] = [],
): string[] =>
  ranking
    .map(({ orientation }) => toSingleLine(orientation?.imageUrl))
    .filter((imageUrl) => imageUrl !== "" && !failedUrls.includes(imageUrl))
    .slice(0, PREVIEW_IMAGES);
