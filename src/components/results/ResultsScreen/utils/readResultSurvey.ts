import { getSurvey } from "@/services/api/client/getSurvey";
import {
  type Survey,
  SurveyLoadStatus,
  type SurveyResult,
} from "@/types/survey";

// The quiz a result belongs to: exactly the survey the result names, never
// the latest one of its project, so an old result keeps reading as it did.
// It answers with nothing when the result names no survey, or that survey
// cannot be read - it is gone, no longer public, or the read failed.
export const readResultSurvey = async (
  { surveyId }: SurveyResult,
  language: string,
  signal: AbortSignal,
): Promise<Survey | undefined> => {
  if (surveyId === undefined) return undefined;

  const load = await getSurvey(surveyId, language, { signal });

  return load.status === SurveyLoadStatus.Ready ? load.survey : undefined;
};
