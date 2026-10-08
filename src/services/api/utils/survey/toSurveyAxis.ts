import type { AxisResponse } from "@/services/api/schemas/survey";
import type { SurveyAxis } from "@/types/survey";

import { toKnownIds } from "./toKnownIds";

const UNKNOWN_AXIS_TYPE = "other";

export const toSurveyAxis = (
  response: AxisResponse,
  quiz: { orientationIds: ReadonlySet<string> },
): SurveyAxis => {
  const { name } = response;
  const packedName = typeof name === "object" ? name : undefined;

  return {
    id: response.id,
    name: typeof name === "string" ? name : packedName?.name,
    type: response.type ?? UNKNOWN_AXIS_TYPE,
    description: response.description,
    positiveOrientationIds: toKnownIds(
      response.positiveOrientations,
      quiz.orientationIds,
    ),
    negativeOrientationIds: toKnownIds(
      response.negativeOrientations,
      quiz.orientationIds,
    ),
    categoryName: packedName?.category,
    isMain: packedName?.isMain === true,
  };
};
