import type { ResultModuleResponse } from "@/services/api/schemas/resultModule";
import { toKnownIds } from "@/services/api/utils/survey/toKnownIds";
import type { ResultModule } from "@/types/results";

import { toModuleValues } from "./toModuleValues";

export const toResultModule = (
  response: ResultModuleResponse,
  known: { orientationIds: ReadonlySet<string>; axisIds: ReadonlySet<string> },
): ResultModule => ({
  id: response.id,
  type: response.type,
  position: response.position,
  column: response.column,
  orientationIds: [
    ...new Set(toKnownIds(response.orientationIds, known.orientationIds)),
  ],
  axisIds: [...new Set(toKnownIds(response.axisIds, known.axisIds))],
  values: toModuleValues(response.values),
});
