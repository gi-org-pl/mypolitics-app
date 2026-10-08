import type { Orientation } from "@/types/orientation";
import { toSingleLine } from "@/utils/text/toSingleLine";

export const hasOrientationTitle = (orientation: Orientation): boolean =>
  toSingleLine(orientation.name) !== "" || Boolean(orientation.imageUrl);
