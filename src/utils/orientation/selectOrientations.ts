import type { OrientationBase, OrientationType } from "@/types/orientation";

export const selectOrientations = <T extends OrientationBase>(
  orientations: T[],
  type?: OrientationType,
): T[] =>
  orientations.filter(
    (orientation) =>
      !orientation.isHidden &&
      (type === undefined || orientation.type === type),
  );
