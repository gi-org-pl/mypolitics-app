import type { ResultModuleParamReader } from "@/types/results";
import { isOneOf } from "@/utils/array/isOneOf";

// A choice is the saved value when the definition allows it, and the
// definition's fallback when it allows no such value or the name is left out.
export const readChoiceParam: ResultModuleParamReader<"choice"> = (
  definition,
  value,
) => (isOneOf(definition.values, value) ? value : definition.fallback);
