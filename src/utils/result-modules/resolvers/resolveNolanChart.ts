import { COLOR_KEY_PREFIX, LABEL_KEY_PREFIX } from "@/constants/results";
import type { ModuleResolver } from "@/types/results";
import { getRecordAxes } from "@/utils/result-modules/axes/getRecordAxes";
import { toResolvedAxis } from "@/utils/result-modules/axes/toResolvedAxis";
import { getModuleValues } from "@/utils/result-modules/values/getModuleValues";
import { getValuesByPrefix } from "@/utils/result-modules/values/getValuesByPrefix";
import { getCompassAxes } from "@/utils/running-state/compass/getCompassAxes";

// A Nolan chart is about the two compass axes of its record: the one of type
// `compass_x_axis` is the horizontal one, the one of type `compass_y_axis`
// the vertical one. They are looked for among the axes the record lists, not
// among every axis of the quiz, and any other axis it lists is not used. It
// is not drawn when it does not find both, or when one of them lacks a side.
// The map is given the labels and the colours its record sets, each by the
// name behind the prefix of its key.
export const resolveNolanChart: ModuleResolver<"nolan_chart"> = (
  record,
  context,
) => {
  const { survey } = context;
  const axes = getCompassAxes({
    orientations: survey.orientations,
    axes: getRecordAxes(record, survey),
  });
  const horizontal = axes && toResolvedAxis(axes.horizontal, context);
  const vertical = axes && toResolvedAxis(axes.vertical, context);
  const values = getModuleValues(record);

  return horizontal && vertical
    ? {
        type: "nolan_chart",
        horizontal,
        vertical,
        labels: getValuesByPrefix(values, LABEL_KEY_PREFIX),
        colors: getValuesByPrefix(values, COLOR_KEY_PREFIX),
      }
    : undefined;
};
