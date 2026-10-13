import type { Orientation } from "@/types/orientation";

export interface OrientationListItemProps {
  orientation: Orientation;
  onPick: (orientationId: string) => void;
}
