import type { ResolvedHeader, ResultEntry } from "@/types/results";
import { getMatchBand, type MatchBand } from "@/utils/results/getMatchBand";

const NO_MATCH: MatchBand = "none";

// The leader of a result: the header's orientation, once its value is a
// partial match at least. Below that the header still carries it - and shows
// no match, or names it all the same when its record says so - and nothing is
// linked to it.
export const getLeader = (
  header?: Partial<ResolvedHeader>,
): ResultEntry | undefined =>
  header?.orientation && getMatchBand(header.confidence) !== NO_MATCH
    ? { orientation: header.orientation, value: header.confidence }
    : undefined;
