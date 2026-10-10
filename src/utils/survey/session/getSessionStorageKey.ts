import { SURVEY_SESSION_STORAGE_KEY } from "@/constants/survey";

// One record per quiz.
export const getSessionStorageKey = (surveyId: string): string =>
  `${SURVEY_SESSION_STORAGE_KEY}:${surveyId}`;
