import type { Orientation } from "@/types/orientation";
import type { NolanPosition, NolanQuadrantKey } from "@/types/results";

// A place on the map. `NolanPosition` and `CompassPoint` both fit as they
// are, so neither is converted.
export type CompassMapPoint = Pick<NolanPosition, "x" | "y">;

// The taker's place. Its level and quadrant decide which quadrant is filled.
export type CompassMapPosition = Pick<
  NolanPosition,
  "x" | "y" | "level" | "quadrant"
>;

// Colours by corner. `NolanQuadrants` of `NolanChart` fits as it is.
export type CompassMapQuadrants = Partial<
  Record<NolanQuadrantKey, { color?: string }>
>;

export interface CompassMapProps {
  quadrants?: CompassMapQuadrants;
  position: CompassMapPosition | null; // the taker: the dot, its halo and the filled quadrant. null = none of the three
  otherOrientation?: Orientation; // the other side of a comparison
  otherPosition?: CompassMapPoint | null;
  description?: string; // given: the map is one image with this description. Absent: the parent describes it
}
