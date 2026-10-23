import type { ModuleResolver } from "@/types/results";
import { getRecordEntries } from "@/utils/result-modules/orientations/getRecordEntries";

// A single axis is about the first shown orientation of its record. With no
// shown orientation left it is not drawn.
export const resolveSingleAxis: ModuleResolver<"single_axis"> = (
  record,
  context,
) => {
  const [entry] = getRecordEntries(record, context);

  return entry && { type: "single_axis", entry, marker: record.marker };
};
