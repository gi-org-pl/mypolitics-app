import { MATCH_BAND_COLORS } from "@/constants/results";
import { getMatchBand } from "@/utils/results/getMatchBand";

import type { RankedEntry } from "../../RankedRow/RankedRow.types";
import type { ArchetypeEntry } from "../Archetype.types";

export const toRankedEntry = (archetype: ArchetypeEntry): RankedEntry => ({
  orientation: {
    ...archetype.orientation,
    color: MATCH_BAND_COLORS[getMatchBand(archetype.match)],
  },
  value: archetype.match,
});
