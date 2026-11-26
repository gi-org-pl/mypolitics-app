import type { ResultModuleParamValue } from "@/types/results";

// The parameters of a record as they were saved, name by name. A name whose
// value could not be read is left out. No name is interpreted here: one the
// record's type does not read, or one the app does not know, is kept.
export const toParamValues = (
  values: Record<string, ResultModuleParamValue | undefined>,
): Record<string, ResultModuleParamValue> =>
  Object.fromEntries(
    Object.entries(values).flatMap(([name, value]) =>
      value === undefined ? [] : [[name, value]],
    ),
  );
