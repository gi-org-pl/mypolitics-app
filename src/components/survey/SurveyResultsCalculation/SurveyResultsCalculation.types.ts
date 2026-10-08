import type { MessageDescriptor } from "@lingui/core";

export type SurveyResultsCalculationState =
  | "running" // lines are on the field - also while the last line holds
  | "failed-not-saved" // the answers could not be saved
  | "failed-not-ready" // the result is not ready in time
  | "link-not-sent"; // the result is ready, the link could not be sent

export interface SurveyResultsCalculationProps {
  state: SurveyResultsCalculationState;
  lines: string[]; // the lines of the run so far, oldest first, passed translated. The last one is the current line
  onRetry: () => void; // "Spróbuj ponownie", in the two failed states
  onSeeResults: () => void; // "Zobacz wyniki", on the notice
}

// The states in which a message stands where the lines were.
export type ResultsCalculationMessageState = Exclude<
  SurveyResultsCalculationState,
  "running"
>;

export interface ResultsCalculationMessage {
  text: MessageDescriptor;
  actionLabel: MessageDescriptor; // the name of its one button
}
