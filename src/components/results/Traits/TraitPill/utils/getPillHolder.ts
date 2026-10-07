import type { AxisOrientation } from "@/types/axis";

import type { TraitHolder } from "../../Traits.types";

export const getPillHolder = (
  holder: TraitHolder,
  party?: AxisOrientation,
): TraitHolder => (party ? holder : "taker");
