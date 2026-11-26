import type { Orientation } from "@/types/orientation";

export interface OrientationListProps {
  orientations: Orientation[]; // the offered orientations, in the order they are listed
  onPick: (orientationId: string) => void;
}
