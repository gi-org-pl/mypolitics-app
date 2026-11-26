import {
  RESULT_MODULE_KEYS,
  RESULT_MODULE_VALUE_DEFINITIONS,
} from "@/constants/results";
import type {
  ResultModuleKey,
  ResultModuleOf,
  ResultModuleType,
  ResultModuleValuesOf,
} from "@/types/results";

import { readValue } from "./readValue";

// The values of a record as the app works with them: the keys its type reads,
// each read by its definition. A key the record leaves out, or holds a value
// its definition does not allow for, has its default, or nothing when it has
// none. Every other key on the record - one of another type, or one nobody
// defines - is left where it is and is not in the result.
export const getModuleValues = <Type extends ResultModuleType>(
  module: ResultModuleOf<Type>,
): ResultModuleValuesOf<Type> => {
  const keys: readonly ResultModuleKey[] = RESULT_MODULE_KEYS[module.type];

  // The keys and the values are the ones of the two tables the result type is
  // derived from. TypeScript cannot follow an object built key by key, so
  // this is the one place that says so.
  return Object.fromEntries(
    keys.map((key) => [
      key,
      readValue(RESULT_MODULE_VALUE_DEFINITIONS[key], module.values[key]),
    ]),
  ) as ResultModuleValuesOf<Type>;
};
