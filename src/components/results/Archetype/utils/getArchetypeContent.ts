import { getMatchBand } from "@/utils/results/getMatchBand";

import type { ArchetypeContent, ArchetypeEntry } from "../Archetype.types";
import { toDescription } from "./toDescription";

export const getArchetypeContent = (
  leader: ArchetypeEntry | null,
  rest: ArchetypeEntry[],
): ArchetypeContent => {
  const isMatched = leader !== null && getMatchBand(leader.match) !== "none";
  const shortDescription = isMatched
    ? toDescription(leader.orientation?.description)
    : "";
  const fullDescription = isMatched
    ? toDescription(leader.orientation?.fullDescription)
    : "";

  return {
    isMatched,
    shortDescription,
    fullDescription,
    ranking: leader && !isMatched ? [leader, ...rest] : rest,
    hasDescription:
      fullDescription !== "" && fullDescription !== shortDescription,
    hasRanking: rest.length > 0,
  };
};
