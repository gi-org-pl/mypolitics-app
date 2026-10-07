import type { AxisOrientation } from "@/types/axis";

import type { TraitItem } from "../Traits.types";

export interface TraitPillProps {
  item: TraitItem;
  party?: AxisOrientation;
}
