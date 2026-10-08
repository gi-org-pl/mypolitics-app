import type { SurveyEmail, SurveySessionAction } from "@/types/survey";

// The address and the consent are held in memory only; `null` drops them.
// Results calculation may still change them: it drops the e-mail once the
// request that follows the result is done with it.
export const setSessionEmail: SurveySessionAction<
  [email: SurveyEmail | null]
> = (_survey, session, email) =>
  session.phase === "email-capture" || session.phase === "results-calculation"
    ? { ...session, email }
    : session;
