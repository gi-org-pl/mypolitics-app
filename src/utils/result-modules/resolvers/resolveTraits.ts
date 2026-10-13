import type { ModuleResolver } from "@/types/results";
import { getEarnedTraitIds } from "@/utils/result-modules/orientations/getEarnedTraitIds";
import { getShownOrientations } from "@/utils/result-modules/orientations/getShownOrientations";

// Traits shows every shown orientation of its record as the catalogue, and
// which of them the result earned. With no shown orientation left it is not
// drawn.
export const resolveTraits: ModuleResolver<"traits"> = (record, context) => {
  const traits = getShownOrientations(record.orientationIds, context);

  return traits.length > 0
    ? { type: "traits", traits, earnedIds: getEarnedTraitIds(traits, context) }
    : undefined;
};
