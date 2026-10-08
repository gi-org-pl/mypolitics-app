import type { SurveySessionAction } from "@/types/survey";

// "Pomiń" on category select: whatever was picked is dropped.
export const skipSessionTopics: SurveySessionAction = (_survey, session) =>
  session.phase === "category-select"
    ? { ...session, topicIds: [], areTopicsConfirmed: true, phase: "questions" }
    : session;
