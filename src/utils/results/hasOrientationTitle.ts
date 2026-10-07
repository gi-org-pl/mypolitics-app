import type { AxisOrientation } from "@/types/axis";
import { toSingleLine } from "@/utils/text/toSingleLine";

export const hasOrientationTitle = (orientation: AxisOrientation): boolean =>
  toSingleLine(orientation.name) !== "" || Boolean(orientation.imageUrl);
