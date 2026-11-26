import type { ResultModuleLowMatch } from "@/types/results";
import { getMatchBand } from "@/utils/results/getMatchBand";

import type { ArchetypeContent, ArchetypeEntry } from "../Archetype.types";
import { toDescription } from "./toDescription";

// What the card shows around its leader. The leader is named - "matched" -
// from a partial match up, and below it when the card is set to name it all
// the same and the leader has a match of its own: with every match absent
// nobody leads, and the card names nobody, as the header does. A leader that
// is not named has no descriptions and stands in the ranking with the others.
export const getArchetypeContent = (
  leader: ArchetypeEntry | null,
  rest: ArchetypeEntry[],
  lowMatch: ResultModuleLowMatch = "no_match",
  isLeaderScored = true,
): ArchetypeContent => {
  const isNamedLowMatch = lowMatch === "named" && isLeaderScored;
  const isMatched =
    leader !== null &&
    (isNamedLowMatch || getMatchBand(leader.match) !== "none");
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
