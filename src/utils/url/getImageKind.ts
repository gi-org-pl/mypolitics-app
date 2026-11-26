import type { ImageKind } from "@/types/common";

import { isVectorImage } from "./isVectorImage";

// What the image behind an address is drawn as: a vector image is a glyph, an
// icon with a size of its own; everything else is a picture.
export const getImageKind = (address?: string | null): ImageKind =>
  isVectorImage(address) ? "glyph" : "picture";
