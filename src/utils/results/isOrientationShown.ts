import type { Orientation } from "@/types/orientation";

export const isOrientationShown = (
  orientation?: Pick<Orientation, "isHidden">,
): boolean => orientation?.isHidden !== true;
