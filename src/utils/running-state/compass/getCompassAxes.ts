import {
  COMPASS_X_AXIS_TYPE,
  COMPASS_Y_AXIS_TYPE,
} from "@/constants/checkpoint";
import type { CompassAxes } from "@/types/checkpoint";
import type { Survey, SurveyAxis } from "@/types/survey";
import { toKnownAxis } from "@/utils/running-state/axes/toKnownAxis";
import { getOrientationIds } from "@/utils/running-state/orientations/getOrientationIds";

const hasBothSides = (axis: SurveyAxis): boolean =>
  axis.negativeOrientationIds.length > 0 &&
  axis.positiveOrientationIds.length > 0;

// The two axes of the quiz's compass, each as the quiz has it: the first axis
// of type `compass_x_axis` is the horizontal one, the first of type
// `compass_y_axis` the vertical one. Without either, or when one of them has
// a side with no orientation of the quiz, the quiz has no compass.
export const getCompassAxes = (
  survey: Pick<Survey, "orientations" | "axes">,
): CompassAxes | null => {
  const orientationIds = getOrientationIds(survey);
  const [horizontal, vertical] = [COMPASS_X_AXIS_TYPE, COMPASS_Y_AXIS_TYPE].map(
    (axisType) => {
      const axis = survey.axes.find(({ type }) => type === axisType);

      return axis && toKnownAxis(axis, orientationIds);
    },
  );

  return horizontal &&
    vertical &&
    hasBothSides(horizontal) &&
    hasBothSides(vertical)
    ? { horizontal, vertical }
    : null;
};
