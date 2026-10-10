import type { SurveyLoadState, SurveyLoadStatus } from "@/types/survey";

export interface SurveyQuestionnaireProps {
  load: Exclude<SurveyLoadState, { status: typeof SurveyLoadStatus.NotFound }>; // not found is the page's
  onRetry: () => void;
}
