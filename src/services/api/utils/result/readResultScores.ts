import { resultOrientationResponseSchema } from "@/services/api/schemas/result";
import type { ScoreTotal } from "@/types/checkpoint";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { parseItems } from "@/utils/zod/parseItems";

import { toScoreTotal } from "./toScoreTotal";

// The scores of a result, by orientation identifier. The list is read item by
// item, so that one bad item never costs the result its others. An item is
// dropped before the duplicates are, so that the one kept is the first that
// can be read.
export const readResultScores = (
  orientations: unknown,
): Record<string, ScoreTotal> =>
  Object.fromEntries(
    uniqueBy(
      parseItems(orientations, resultOrientationResponseSchema),
      ({ id }) => id,
    ).map((orientation) => [orientation.id, toScoreTotal(orientation)]),
  );
