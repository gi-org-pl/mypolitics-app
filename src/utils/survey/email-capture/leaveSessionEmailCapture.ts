import { SurveyResultState, type SurveySessionAction } from "@/types/survey";

// "Wyślij i zobacz wyniki" (given) keeps the e-mail for the request that
// follows the result; "Pomiń" drops it. Given with no e-mail held is a skip.
export const leaveSessionEmailCapture: SurveySessionAction<
  [isGiven: boolean]
> = (_survey, session, isGiven) =>
  session.phase === "email-capture"
    ? {
        ...session,
        phase: "results-calculation",
        email: isGiven ? session.email : null,
        resultState: SurveyResultState.NotSent,
      }
    : session;
