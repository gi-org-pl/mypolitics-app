import type { Orientation } from "@/types/orientation";
import { findOrientation } from "@/utils/orientation/findOrientation";

// Of the orientations, the ones the leader lists as linked, in the leader's
// order. Without a leader there are none.
export const getLinkedOrientations = (
  orientations: Orientation[],
  leader?: Pick<Orientation, "linkedOrientationIds">,
): Orientation[] =>
  (leader?.linkedOrientationIds ?? []).flatMap(
    (id) => findOrientation(orientations, id) ?? [],
  );
