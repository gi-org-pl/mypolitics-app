import type { ResultModuleValueReader } from "@/types/results";
import { isOneOf } from "@/utils/array/isOneOf";

// A choice is the saved value when the definition lists it, and the
// definition's fallback when it lists no such value or the key is left out.
export const readChoiceValue: ResultModuleValueReader<"choice"> = (
  definition,
  value,
) => (isOneOf(definition.choices, value) ? value : definition.fallback);
