import type { ResultModuleValueReader } from "@/types/results";

// Yes or no is the saved value when it is a boolean. Anything else, a key
// that is left out included, is the definition's fallback.
export const readBooleanValue: ResultModuleValueReader<"boolean"> = (
  { fallback },
  value,
) => (typeof value === "boolean" ? value : fallback);
