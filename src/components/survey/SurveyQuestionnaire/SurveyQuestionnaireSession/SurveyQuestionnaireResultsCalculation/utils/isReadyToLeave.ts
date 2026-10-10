import {
  HandInState,
  ResultLinkState,
} from "../SurveyQuestionnaireResultsCalculation.types";

// A run is ready to leave when the result is calculated, the link request -
// if one was made - has ended, and the run has stayed long enough.
export const isReadyToLeave = (run: {
  handIn: HandInState;
  link: ResultLinkState;
  hasStayedLongEnough: boolean;
}): boolean =>
  run.handIn === HandInState.Calculated &&
  run.link !== ResultLinkState.Pending &&
  run.hasStayedLongEnough;
