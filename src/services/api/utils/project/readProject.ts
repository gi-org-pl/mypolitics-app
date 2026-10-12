import { projectResponseSchema } from "@/services/api/schemas/project";
import type { ProjectLoadResult } from "@/types/project";
import { SurveyLoadStatus } from "@/types/survey";

export const readProject = (
  response: unknown,
  projectId: string,
): ProjectLoadResult => {
  const { success, data } = projectResponseSchema.safeParse(response);

  if (!success) return { status: SurveyLoadStatus.Failed };

  return {
    status: SurveyLoadStatus.Ready,
    project: {
      id: projectId,
      latestSurveyId: data.latestSurveyId ?? undefined,
    },
  };
};
