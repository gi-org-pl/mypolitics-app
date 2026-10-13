import {
  type ResultLoadResult,
  ResultLoadStatus,
  type SurveyResult,
} from "@/types/survey";

import { FriendRefusal } from "../ResultsComparison.types";

// The result of a friend that can be compared with, or why it cannot.
export type FriendRead =
  | { result: SurveyResult; refusal?: undefined }
  | { result?: undefined; refusal: FriendRefusal };

// What the read of the result of a friend gives the comparison: the result,
// when it is calculated and was handed in for the survey of the taker, and
// the refusal otherwise. A result that does not exist, is not calculated yet
// or could not be read is refused the same way.
export const readFriendResult = (
  load: ResultLoadResult,
  surveyId: string,
): FriendRead => {
  if (load.status !== ResultLoadStatus.Ready || !load.result.isCalculated) {
    return { refusal: FriendRefusal.Unreadable };
  }

  return load.result.surveyId === surveyId
    ? { result: load.result }
    : { refusal: FriendRefusal.OtherSurvey };
};
