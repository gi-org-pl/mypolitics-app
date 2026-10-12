import { useState } from "react";

import type { ArchetypeEntry } from "../../../Archetype.types";
import { getPreviewImages } from "./getPreviewImages";

// The images of the preview, and a way to say that one of them did not load.
// A failure belongs to the address, so it holds for every entry that uses it
// and for as long as the preview is on screen.
export const usePreviewImages = (ranking: ArchetypeEntry[]) => {
  const [failedUrls, setFailedUrls] = useState<string[]>([]);

  return {
    images: getPreviewImages(ranking, failedUrls),
    markFailed: (imageUrl: string) =>
      setFailedUrls((urls) => [...urls, imageUrl]),
  };
};
