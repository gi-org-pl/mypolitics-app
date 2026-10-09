import type { SurveySessionAction } from "@/types/survey";

import { getValidCategoryIds } from "./getValidCategoryIds";

// A category is picked or dropped. Nothing is confirmed yet.
export const setSessionCategories: SurveySessionAction<
  [prioritizedCategoryIds: string[]]
> = (survey, session, prioritizedCategoryIds) =>
  session.phase === "category-select"
    ? {
        ...session,
        prioritizedCategoryIds: getValidCategoryIds(
          survey,
          prioritizedCategoryIds,
        ),
      }
    : session;
