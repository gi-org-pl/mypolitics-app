import type { SurveySessionAction } from "@/types/survey";

import { getValidTopics } from "./getValidTopics";

// A topic is picked or dropped. Nothing is confirmed yet.
export const setSessionTopics: SurveySessionAction<[topicIds: string[]]> = (
  survey,
  session,
  topicIds,
) =>
  session.phase === "category-select"
    ? { ...session, topicIds: getValidTopics(survey, topicIds) }
    : session;
