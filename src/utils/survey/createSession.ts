import type { Survey, SurveySession } from "@/types/survey";

import { getFirstPhase } from "./getFirstPhase";

export const createSession = (
  survey: Survey,
  options?: { areCheckpointsOff?: boolean },
): SurveySession => ({
  id: crypto.randomUUID(),
  surveyId: survey.id,
  entries: [],
  topicIds: [],
  areTopicsConfirmed: false,
  phase: getFirstPhase(survey),
  areCheckpointsOff: options?.areCheckpointsOff === true,
  demographics: {},
  areDemographicsGiven: false,
  checkpointRecord: { cardsShown: [], timeSamples: [] },
  email: null,
  resultState: "not-sent",
});
