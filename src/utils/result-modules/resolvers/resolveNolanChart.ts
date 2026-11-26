import type { ModuleResolver } from "@/types/results";
import { getRecordAxes } from "@/utils/result-modules/axes/getRecordAxes";
import { toResolvedAxis } from "@/utils/result-modules/axes/toResolvedAxis";
import { getCompassAxes } from "@/utils/running-state/compass/getCompassAxes";

// A Nolan chart is about the two compass axes of its record: the one of type
// `compass_x_axis` is the horizontal one, the one of type `compass_y_axis`
// the vertical one. They are looked for among the axes the record lists, not
// among every axis of the quiz, and any other axis it lists is not used. It
// is not drawn when it does not find both, or when one of them lacks a side.
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

  return horizontal && vertical
    ? {
        type: "nolan_chart",
        horizontal,
        vertical,
        labels: record.labels,
        colors: record.colors,
      }
    : undefined;
};
