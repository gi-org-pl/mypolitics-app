import type { ModuleResolver } from "@/types/results";
import { getRecordEntries } from "@/utils/result-modules/orientations/getRecordEntries";

// An archetype lists every shown orientation of its record with its value.
// With no shown orientation left it is not drawn.
export const resolveArchetype: ModuleResolver<"archetype"> = (
  record,
  context,
) => {
  const entries = getRecordEntries(record, context);

  return entries.length > 0 ? { type: "archetype", entries } : undefined;
};
