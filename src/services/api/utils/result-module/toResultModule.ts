import { RESULT_MODULE_SLOTS } from "@/constants/results";
import type { ResultModuleResponse } from "@/services/api/schemas/resultModule";
import { toKnownIds } from "@/services/api/utils/survey/toKnownIds";
import type { ResultModule } from "@/types/results";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

import { toParamValues } from "./toParamValues";
import { toSlotValues } from "./toSlotValues";

export const toResultModule = (
  response: ResultModuleResponse,
  known: { orientationIds: ReadonlySet<string>; axisIds: ReadonlySet<string> },
): ResultModule => {
  const slots = RESULT_MODULE_SLOTS[response.type];

  return {
    id: response.id,
    type: response.type,
    position: response.position,
    column: response.column,
    title: response.title,
    description: response.description,
    orientationIds: [
      ...new Set(toKnownIds(response.orientationIds, known.orientationIds)),
    ],
    axisIds: [...new Set(toKnownIds(response.axisIds, known.axisIds))],
    params: toParamValues(response.params),
    labels: toSlotValues(response.labels, slots.labels, toTrimmedText),
    colors: toSlotValues(response.colors, slots.colors, getSafeColor),
  };
};
