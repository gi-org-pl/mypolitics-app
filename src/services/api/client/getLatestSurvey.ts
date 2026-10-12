import type { ApiRequestOptions } from "@/types/api";
import { type SurveyLoadResult, SurveyLoadStatus } from "@/types/survey";

import { getProject } from "./getProject";
import { getSurvey } from "./getSurvey";

// The quiz of a project: the survey the project names as its latest, so a
// new version of a quiz is read without a change in the app. Two requests,
// one after the other - the project, then that survey - each with the signal
// and the time limit of the caller. A project that does not exist, or has no
// survey to take, is a quiz that is not found; a project that cannot be read
// is a quiz that failed to load.
export const getLatestSurvey = async (
  projectId: string,
  language: string,
  options?: ApiRequestOptions,
): Promise<SurveyLoadResult> => {
  const result = await getProject(projectId, options);

  if (result.status !== SurveyLoadStatus.Ready) return result;

  const { latestSurveyId } = result.project;

  if (latestSurveyId === undefined) {
    return { status: SurveyLoadStatus.NotFound };
  }

  return getSurvey(latestSurveyId, language, options);
};
