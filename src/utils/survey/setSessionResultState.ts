import type { SurveyResultState, SurveySessionAction } from "@/types/survey";

// How far the hand-in got. It only records: when the hand-in is sent and what
// its replies mean is the results calculation's.
export const setSessionResultState: SurveySessionAction<
  [resultState: SurveyResultState]
> = (_survey, session, resultState) =>
  session.phase === "results-calculation" && session.resultState !== resultState
    ? { ...session, resultState }
    : session;
