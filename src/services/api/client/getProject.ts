import { isNotFound } from "@/services/api/utils/error/isNotFound";
import { toApiFailure } from "@/services/api/utils/error/toApiFailure";
import { readProject } from "@/services/api/utils/project/readProject";
import { toRequestConfig } from "@/services/api/utils/request/toRequestConfig";
import type { ApiRequestOptions } from "@/types/api";
import type { ProjectLoadResult } from "@/types/project";
import { SurveyLoadStatus } from "@/types/survey";

import { apiClient } from "./apiClient";

// No language is named: nothing that is read of a project is translated.
export const getProject = async (
  projectId: string,
  options?: ApiRequestOptions,
): Promise<ProjectLoadResult> => {
  try {
    const { data } = await apiClient.get<unknown>(
      `/v1/project/${encodeURIComponent(projectId)}`,
      toRequestConfig(options),
    );

    return readProject(data, projectId);
  } catch (error) {
    return isNotFound(toApiFailure(error))
      ? { status: SurveyLoadStatus.NotFound }
      : { status: SurveyLoadStatus.Failed };
  }
};
