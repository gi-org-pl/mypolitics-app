import type { ScoreTotal } from "@/types/checkpoint";
import type { Orientation } from "@/types/orientation";
import type { ResolvedRankedEntry } from "@/types/results";
import { toResultEntry } from "@/utils/results/toResultEntry";

// The orientations as the rows of a ranking, in the order given: each with
// its value by the scores and with its official mark.
export const getRankedEntries = (
  orientations: readonly Orientation[],
  scores: Readonly<Record<string, ScoreTotal>>,
): ResolvedRankedEntry[] =>
  orientations.map((orientation) => ({
    ...toResultEntry(orientation, scores),
    isOfficial: orientation.isOfficial === true,
  }));
