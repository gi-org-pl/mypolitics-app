import type { ResolvedResult } from "@/types/results";
import type { Survey, SurveyResult } from "@/types/survey";

export interface ResultsScreenProps {
  resultId: string; // from the address
}

// The states of the screen, as the spec lists them. An enum, written as a
// constant with a type of the same name - see ApiFailureKind in types/api.ts.
export const ResultsScreenStatus = {
  Loading: "loading", // the result or its quiz is on the way
  Ready: "ready", // both are read, and the header or a module can be drawn
  NotConfigured: "not-configured", // both are read, and the quiz gives nothing to draw
  NotReady: "not-ready", // the result was not calculated in time
  NotFound: "not-found", // the API has no such result
  Failed: "failed", // anything else
} as const;

export type ResultsScreenStatus =
  (typeof ResultsScreenStatus)[keyof typeof ResultsScreenStatus];

// A result that can be drawn: the quiz it belongs to, the result as read, and
// what the header and the modules are given.
export interface ReadyResults {
  status: typeof ResultsScreenStatus.Ready;
  survey: Survey;
  result: SurveyResult;
  resolved: ResolvedResult;
}

// One state at a time: what the screen draws follows from it alone.
export type ResultsScreenState =
  | { status: typeof ResultsScreenStatus.Loading }
  | ReadyResults
  | { status: typeof ResultsScreenStatus.NotConfigured; survey: Survey }
  | { status: typeof ResultsScreenStatus.NotReady }
  | { status: typeof ResultsScreenStatus.NotFound }
  | { status: typeof ResultsScreenStatus.Failed };

// The states that stand in for the result: everything but ready.
export type ResultsNoticeStatus = Exclude<
  ResultsScreenStatus,
  typeof ResultsScreenStatus.Ready
>;
