import { getRankedValue } from "@/utils/results/getRankedValue";
import { isOrientationShown } from "@/utils/results/isOrientationShown";

import type { ArchetypeEntry, ArchetypeRanking } from "../Archetype.types";

const ABSENT_RANK = -1;

export const getArchetypeRanking = (
  archetypes?: ArchetypeEntry[],
): ArchetypeRanking => {
  if (!Array.isArray(archetypes)) return { leader: null, rest: [] };

  const [leader = null, ...rest] = archetypes
    .filter(
      (archetype) =>
        typeof archetype === "object" &&
        archetype !== null &&
        isOrientationShown(archetype.orientation),
    )
    .map((archetype, index) => {
      const match = getRankedValue({ value: archetype.match });

      return {
        archetype: { ...archetype, match: match ?? 0 },
        index,
        rank: match ?? ABSENT_RANK,
      };
    })
    .sort(
      (first, second) => second.rank - first.rank || first.index - second.index,
    )
    .map(({ archetype }) => archetype);

  return { leader, rest };
};
