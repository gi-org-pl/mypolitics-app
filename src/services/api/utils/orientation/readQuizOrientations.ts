import {
  type OrientationResponse,
  orientationResponseSchema,
} from "@/services/api/schemas/orientation";
import type { QuizOrientation } from "@/types/orientation";

import { toQuizOrientation } from "./toQuizOrientation";

export const readQuizOrientations = (
  response: unknown,
  options: { isOfficialQuiz: boolean },
): QuizOrientation[] => {
  if (!Array.isArray(response)) return [];

  const responsesById = new Map<string, OrientationResponse>();

  for (const item of response) {
    const { success, data } = orientationResponseSchema.safeParse(item);

    if (success && !responsesById.has(data.id)) {
      responsesById.set(data.id, data);
    }
  }

  return Array.from(responsesById.values(), (orientation) => ({
    ...toQuizOrientation(orientation, options),
    linkedOrientationIds: [...new Set(orientation.linkedOrientations)].filter(
      (id) => id !== orientation.id && responsesById.has(id),
    ),
  }));
};
