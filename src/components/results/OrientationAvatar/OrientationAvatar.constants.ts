import type { OrientationAvatarSize } from "./OrientationAvatar.types";

// The size of the disc: 24 px in a list of orientations, 32 px where it
// names a side of a comparison.
export const AVATAR_SIZE_CLASS_NAMES: Record<OrientationAvatarSize, string> = {
  small: "size-6",
  regular: "size-8",
};
