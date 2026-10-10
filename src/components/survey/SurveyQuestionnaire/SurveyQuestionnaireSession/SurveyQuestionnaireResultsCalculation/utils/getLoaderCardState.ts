import type { SurveyResultsCalculationState } from "@/components/survey/SurveyResultsCalculation/SurveyResultsCalculation.types";

import {
  HandInState,
  ResultLinkState,
} from "../SurveyQuestionnaireResultsCalculation.types";

// What the card shows. A failure comes first: a link that was not sent is
// told only when a run is ready to leave, in place of leaving. Everything
// else is a run under way - also a run that is ready and leaves.
export const getLoaderCardState = (run: {
  handIn: HandInState;
  link: ResultLinkState;
  isReadyToLeave: boolean;
}): SurveyResultsCalculationState => {
  if (run.handIn === HandInState.NotSaved) return "failed-not-saved";

  if (run.handIn === HandInState.NotReady) return "failed-not-ready";

  return run.isReadyToLeave && run.link === ResultLinkState.NotSent
    ? "link-not-sent"
    : "running";
};
