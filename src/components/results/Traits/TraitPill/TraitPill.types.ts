import type { Orientation } from "@/types/orientation";

import type { TraitItem } from "../Traits.types";

export interface TraitPillProps {
  item: TraitItem;
  otherOrientation?: Orientation;
}
