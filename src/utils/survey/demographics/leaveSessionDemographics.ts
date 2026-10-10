import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import {
  SurveyResultState,
  type SurveySession,
  type SurveySessionAction,
  type SurveySessionConfig,
} from "@/types/survey";

import { isPhaseInSession } from "@/utils/survey/phases/isPhaseInSession";
import { toResultDemographics } from "./toResultDemographics";

// "Zobacz wyniki" (given) takes all four fields; "Pomiń" always works and
// keeps the picked values for the screen. When e-mail capture is not part of
// the session, an address typed before the taker went back is dropped, so it
// is never used.
export const leaveSessionDemographics: SurveySessionAction<
  [isGiven: boolean, config?: SurveySessionConfig]
> = (survey, session, isGiven, config = SURVEY_SESSION_CONFIG) => {
  const isComplete = toResultDemographics(session.demographics) !== undefined;

  if (session.phase !== "demographics" || (isGiven && !isComplete)) {
    return session;
  }

  const leftSession: SurveySession = {
    ...session,
    areDemographicsGiven: isGiven,
  };

  return isPhaseInSession("email-capture", survey, leftSession, config)
    ? { ...leftSession, phase: "email-capture" }
    : {
        ...leftSession,
        phase: "results-calculation",
        email: null,
        resultState: SurveyResultState.NotSent,
      };
};
