import type { ModuleResolver } from "@/types/results";
import { getRecordEntries } from "@/utils/result-modules/orientations/getRecordEntries";
import { getModuleValues } from "@/utils/result-modules/values/getModuleValues";

// An archetype lists every shown orientation of its record with its value,
// and says what its record does with a leader below a partial match. With no
// shown orientation left it is not drawn.
export const resolveArchetype: ModuleResolver<"archetype"> = (
  record,
  context,
) => {
  const entries = getRecordEntries(record, context);

  const { lowMatch } = getModuleValues(record);

  return entries.length > 0
    ? { type: "archetype", entries, lowMatch }
    : undefined;
};
