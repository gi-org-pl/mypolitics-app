import type { Orientation } from "@/types/orientation";

export type OrientationChipLook = "emphasised" | "quiet" | "neutral";

export interface OrientationChipProps
  extends Pick<Orientation, "name" | "imageUrl" | "color"> {
  look?: OrientationChipLook;
  secondName?: string;
  shortName?: string;
}
