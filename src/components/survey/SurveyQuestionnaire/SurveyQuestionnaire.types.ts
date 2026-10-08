import type { SurveyLoadState } from "@/types/survey";

export interface SurveyQuestionnaireProps {
  load: Exclude<SurveyLoadState, { status: "not-found" }>; // not found is the page's
  onRetry: () => void;
}
