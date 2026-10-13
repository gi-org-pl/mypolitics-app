import type { ModuleResolver } from "@/types/results";
import { getAxisGroups } from "@/utils/result-modules/axes/getAxisGroups";
import { getModuleParams } from "@/utils/result-modules/params/getModuleParams";

// A multi axis shows every axis of its record that has both sides, in the
// groups its grouping makes. With no such axis left it is not drawn.
export const resolveMultiAxis: ModuleResolver<"multi_axis"> = (
  record,
  context,
) => {
  const { groupBy, marker } = getModuleParams(record);
  const groups = getAxisGroups({ axisIds: record.axisIds, groupBy }, context);

  return groups.length > 0 ? { type: "multi_axis", groups, marker } : undefined;
};
