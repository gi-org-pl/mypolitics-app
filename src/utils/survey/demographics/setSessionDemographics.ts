import type { DemographicsValues, SurveySessionAction } from "@/types/survey";

import { getValidDemographics } from "./getValidDemographics";

// A value is picked on the demographics card. Picking gives nothing: only the
// button the card is left with decides whether the values are given.
export const setSessionDemographics: SurveySessionAction<
  [values: DemographicsValues]
> = (_survey, session, values) =>
  session.phase === "demographics"
    ? {
        ...session,
        demographics: getValidDemographics(values),
        areDemographicsGiven: false,
      }
    : session;
