import type { RankedComparison } from "@/types/results";
import { isNumber } from "@/utils/number/isNumber";
import { getComparisonEntry } from "@/utils/results/getComparisonEntry";

import type { RankedEntry } from "../../../RankedRow/RankedRow.types";

// Whether the rows of a ranking draw bars: as soon as one of its entries, or
// the other side of a comparison on one of them, has a value. A ranking with
// no value on either side - the parties linked to the identity of a result -
// is a list of names, and an empty track under each name would say nothing.
export const hasBars = (
  ranking: RankedEntry[],
  comparison?: RankedComparison,
): boolean =>
  ranking.some(
    ({ value, orientation }) =>
      isNumber(value) ||
      getComparisonEntry(comparison, orientation?.id) !== undefined,
  );
