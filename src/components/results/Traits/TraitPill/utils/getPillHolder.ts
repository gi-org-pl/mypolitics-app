import type { Orientation } from "@/types/orientation";

import type { TraitHolder } from "../../Traits.types";

export const getPillHolder = (
  holder: TraitHolder,
  otherOrientation?: Orientation,
): TraitHolder => (otherOrientation ? holder : "taker");
