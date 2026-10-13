import type { ModuleResolver } from "@/types/results";
import { getRecordAxes } from "@/utils/result-modules/axes/getRecordAxes";
import { toResolvedAxis } from "@/utils/result-modules/axes/toResolvedAxis";
import { getModuleParams } from "@/utils/result-modules/params/getModuleParams";

// A double axis is about the first axis of its record: the two sides of the
// axis are its two poles. Without an axis, or with one that lacks a side, it
// is not drawn.
export const resolveDoubleAxis: ModuleResolver<"double_axis"> = (
  record,
  context,
) => {
  const [firstAxis] = getRecordAxes(record, context.survey);
  const axis = firstAxis && toResolvedAxis(firstAxis, context);
  const { marker } = getModuleParams(record);

  return axis && { type: "double_axis", axis, marker };
};
