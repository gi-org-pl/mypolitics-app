import type { Orientation } from "@/types/orientation";

export type OrientationAvatarSize = "small" | "regular";

export interface OrientationAvatarProps
  extends Pick<Orientation, "imageUrl" | "color"> {
  size?: OrientationAvatarSize; // small: beside a name in a list. regular: beside the name of a side
}
