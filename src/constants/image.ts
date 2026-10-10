// Athena's Avatar draws a person in place of an image that fails to load. An
// orientation is not a person, and where it has no image the modules draw
// their own empty mark: with this class a failed image leaves the same empty
// mark instead of the person.
export const AVATAR_WITHOUT_PLACEHOLDER_CLASS_NAME =
  "[&>[aria-hidden=true]]:hidden";

// The same for a row of small pictures, where an entry without an image is
// left out: the whole Avatar goes when its image fails.
export const AVATAR_LEFT_OUT_WITHOUT_IMAGE_CLASS_NAME =
  "has-[>[aria-hidden=true]]:hidden";
