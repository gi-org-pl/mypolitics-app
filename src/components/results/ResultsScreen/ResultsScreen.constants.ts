import { ResultLoadStatus } from "@/types/survey";

import {
  type ResultsScreenState,
  ResultsScreenStatus,
} from "./ResultsScreen.types";

export const LOADING_STATE: ResultsScreenState = {
  status: ResultsScreenStatus.Loading,
};
export const NOT_READY_STATE: ResultsScreenState = {
  status: ResultsScreenStatus.NotReady,
};
export const NOT_FOUND_STATE: ResultsScreenState = {
  status: ResultsScreenStatus.NotFound,
};
export const FAILED_STATE: ResultsScreenState = {
  status: ResultsScreenStatus.Failed,
};

// What the screen is in when a read of the result did not find one.
export const UNREAD_RESULT_STATES: Record<
  Exclude<ResultLoadStatus, typeof ResultLoadStatus.Ready>,
  ResultsScreenState
> = {
  [ResultLoadStatus.NotFound]: NOT_FOUND_STATE,
  [ResultLoadStatus.Failed]: FAILED_STATE,
};
