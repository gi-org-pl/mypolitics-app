import type { ImageKind } from "@/types/common";

// Athena's Avatar draws a person in place of an image that fails to load. An
// orientation is not a person, and where it has no image the modules draw
// their own empty mark: with this class a failed image leaves the same empty
// mark instead of the person.
export const AVATAR_WITHOUT_PLACEHOLDER_CLASS_NAME =
  "[&>[aria-hidden=true]]:hidden";

// How an image is fitted into the place it is drawn in, by its kind. A
// picture covers the place, cut to its shape. A glyph is drawn whole, at its
// own size, in the middle, and is made smaller only when it would not fit: it
// is never enlarged and never cut. Quizzes in use send the icons of their
// ideologies as bare glyphs of 12-21 by 13-19 px, and a glyph that covered a
// round cap of 32 px showed as a cut part of itself.
export const IMAGE_FIT_CLASS_NAMES: Record<ImageKind, string> = {
  picture: "object-cover",
  glyph: "object-scale-down",
};

// The same for an image Athena's Avatar draws: the Avatar covers its place by
// itself, so only a glyph needs a word.
export const AVATAR_IMAGE_FIT_CLASS_NAMES: Record<ImageKind, string> = {
  picture: "",
  glyph: "[&>img]:object-scale-down",
};
