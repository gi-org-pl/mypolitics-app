import type { SurveySessionAction } from "@/types/survey";

import { getValidCategoryIds } from "./getValidCategoryIds";

// A topic is picked or dropped. Nothing is confirmed yet.
export const setSessionTopics: SurveySessionAction<[topicIds: string[]]> = (
  survey,
  session,
  topicIds,
) =>
  session.phase === "category-select"
    ? { ...session, topicIds: getValidCategoryIds(survey, topicIds) }
    : session;
