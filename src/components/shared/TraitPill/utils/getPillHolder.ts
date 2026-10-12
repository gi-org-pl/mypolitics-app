import type { Orientation } from "@/types/orientation";

import type { TraitHolder } from "../TraitPill.types";

export const getPillHolder = (
  holder: TraitHolder,
  otherOrientation?: Orientation,
): TraitHolder => (otherOrientation ? holder : "taker");
