import type { SurveySession } from "@/types/survey";

// A card is not a place to go back from, and nothing leads back from the
// hand-in.
export const canStepBack = (session: SurveySession): boolean =>
  session.phase === "demographics" ||
  session.phase === "email-capture" ||
  (session.phase === "questions" && session.entries.length > 0);
