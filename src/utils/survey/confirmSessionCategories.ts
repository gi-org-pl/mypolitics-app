import type { SurveySessionAction } from "@/types/survey";

// "Idziemy dalej": it takes at least one picked topic.
export const confirmSessionCategories: SurveySessionAction = (
  _survey,
  session,
) =>
  session.phase === "category-select" && session.topicIds.length > 0
    ? { ...session, areTopicsConfirmed: true, phase: "questions" }
    : session;
