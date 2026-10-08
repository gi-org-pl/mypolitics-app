import type { ReactNode, Ref } from "react";

import type { SurveyFrame } from "../SurveyQuestionnaireSession.types";

export interface SurveyQuestionnaireFrameProps {
  quizName: string;
  frame: SurveyFrame;
  isLocked: boolean;
  topRef: Ref<HTMLDivElement>; // the top of the screen, for the view to return to
  onPrevious: () => void;
  onReset: () => void;
  children: ReactNode;
}
