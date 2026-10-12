import type { ReactNode } from "react";

export interface SurveyQuestionnaireBoundaryProps {
  onError: () => void; // the card failed to draw
  children: ReactNode;
}

export interface SurveyQuestionnaireBoundaryState {
  hasFailed: boolean;
}
