export type OrientationChipLook = "emphasised" | "quiet" | "neutral";

export interface OrientationChipProps {
  name?: string;
  imageUrl?: string;
  color?: string;
  look?: OrientationChipLook;
}
