import {
  RESULT_MODULE_PARAM_DEFINITIONS,
  RESULT_MODULE_PARAMS,
} from "@/constants/results";
import type {
  ResultModuleOf,
  ResultModuleParamName,
  ResultModuleParamsOf,
  ResultModuleType,
} from "@/types/results";

import { readParam } from "./readParam";

// The parameters of a record as the app works with them: the names its type
// reads, each read by its definition. A name the record leaves out, or holds
// a value its definition does not allow for, has its default. Every other
// name on the record - one of another type, or one nobody defines - is left
// where it is and is not in the result.
export const getModuleParams = <Type extends ResultModuleType>(
  module: ResultModuleOf<Type>,
): ResultModuleParamsOf<Type> => {
  const names: readonly ResultModuleParamName[] =
    RESULT_MODULE_PARAMS[module.type];

  // The names and the values are the ones of the two tables the result type
  // is derived from. TypeScript cannot follow an object built name by name,
  // so this is the one place that says so.
  return Object.fromEntries(
    names.map((name) => [
      name,
      readParam(RESULT_MODULE_PARAM_DEFINITIONS[name], module.params[name]),
    ]),
  ) as ResultModuleParamsOf<Type>;
};
