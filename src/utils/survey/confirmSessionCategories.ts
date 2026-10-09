import type { SurveySessionAction } from "@/types/survey";

// "Idziemy dalej": it takes at least one picked category.
export const confirmSessionCategories: SurveySessionAction = (
  _survey,
  session,
) =>
  session.phase === "category-select" &&
  session.prioritizedCategoryIds.length > 0
    ? { ...session, areCategoriesConfirmed: true, phase: "questions" }
    : session;
