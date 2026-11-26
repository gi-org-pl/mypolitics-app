import { resultModulePairSchema } from "@/services/api/schemas/resultModule";
import type { ResultModuleValue } from "@/types/results";
import { uniqueBy } from "@/utils/array/uniqueBy";
import { parseItems } from "@/utils/zod/parseItems";

// The values of a record by key, as they were saved. The list is read pair by
// pair: one with no key, or with a value that is not a text, a number, a
// boolean or null, is skipped, and of two with the same key the first that
// can be read counts. Anything that is not a list holds no values. No key is
// interpreted here: one the record's type does not read, or one the app does
// not know, is kept.
export const toModuleValues = (
  pairs: unknown,
): Record<string, ResultModuleValue> =>
  Object.fromEntries(
    uniqueBy(parseItems(pairs, resultModulePairSchema), ({ key }) => key).map(
      ({ key, value }) => [key, value],
    ),
  );
