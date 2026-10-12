import { QUIZ_PROJECT_IDS } from "@/constants/survey";

export const getProjectId = (slug?: string): string | undefined => {
  const wantedSlug = slug?.toLowerCase();

  return Object.entries(QUIZ_PROJECT_IDS).find(
    ([knownSlug]) => knownSlug.toLowerCase() === wantedSlug,
  )?.[1];
};
