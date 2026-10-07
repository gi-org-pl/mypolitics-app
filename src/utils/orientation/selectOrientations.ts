import type { OrientationBase, OrientationType } from "@/types/orientation";
import { isOrientationShown } from "@/utils/results/isOrientationShown";

export const selectOrientations = <T extends OrientationBase>(
  orientations: T[],
  type?: OrientationType,
): T[] =>
  orientations.filter(
    (orientation) =>
      isOrientationShown(orientation) &&
      (type === undefined || orientation.type === type),
  );
