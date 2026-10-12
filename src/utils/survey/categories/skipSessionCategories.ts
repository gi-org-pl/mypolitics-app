import type { SurveySessionAction } from "@/types/survey";

// The skip button of category select: whatever was picked is dropped.
export const skipSessionCategories: SurveySessionAction = (_survey, session) =>
  session.phase === "category-select"
    ? {
        ...session,
        prioritizedCategoryIds: [],
        areCategoriesConfirmed: true,
        phase: "questions",
      }
    : session;
