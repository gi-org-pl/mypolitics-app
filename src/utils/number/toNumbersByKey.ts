import { isNumber } from "./isNumber";

// The numbers of the pairs, by key. A pair whose value is not a number is
// left out; of two pairs with one key the later one counts.
export const toNumbersByKey = (
  pairs: readonly (readonly [key: string, value: unknown])[],
): Record<string, number> =>
  Object.fromEntries(
    pairs.filter((pair): pair is readonly [string, number] =>
      isNumber(pair[1]),
    ),
  );
