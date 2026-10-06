import type { AxisOrientation } from "@/components/shared/UniversalAxis/UniversalAxis.types";

import type { TraitItem } from "../Traits.types";

export interface TraitPillProps {
  item: TraitItem;
  party?: AxisOrientation;
}
