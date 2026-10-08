import { QUIZ_SURVEY_IDS } from "@/constants/survey";

export const getSurveyId = (slug?: string): string | undefined => {
  const wantedSlug = slug?.toLowerCase();

  return Object.entries(QUIZ_SURVEY_IDS).find(
    ([knownSlug]) => knownSlug.toLowerCase() === wantedSlug,
  )?.[1];
};
