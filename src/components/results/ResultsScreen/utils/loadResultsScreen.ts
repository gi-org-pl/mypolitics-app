import { ResultLoadStatus } from "@/types/survey";

import {
  FAILED_STATE,
  NOT_FOUND_STATE,
  NOT_READY_STATE,
  UNREAD_RESULT_STATES,
} from "../ResultsScreen.constants";
import type { ResultsScreenState } from "../ResultsScreen.types";
import { isResultId } from "./isResultId";
import { readCalculatedResult } from "./readCalculatedResult";
import { readResultSurvey } from "./readResultSurvey";
import { toResultsScreenState } from "./toResultsScreenState";

// One loading of the screen, from the result on: the result until it is
// calculated, then the survey it names, in the given language. Two requests,
// one after the other, and nothing per module. It never throws: every way it
// can end is a state of the screen.
export const loadResultsScreen = async (
  resultId: string,
  language: string,
  signal: AbortSignal,
): Promise<ResultsScreenState> => {
  if (!isResultId(resultId)) return NOT_FOUND_STATE;

  const read = await readCalculatedResult(resultId, signal);

  if (read === undefined) return NOT_READY_STATE;

  if (read.status !== ResultLoadStatus.Ready)
    return UNREAD_RESULT_STATES[read.status];

  const survey = await readResultSurvey(read.result, language, signal);

  return survey ? toResultsScreenState(survey, read.result) : FAILED_STATE;
};
