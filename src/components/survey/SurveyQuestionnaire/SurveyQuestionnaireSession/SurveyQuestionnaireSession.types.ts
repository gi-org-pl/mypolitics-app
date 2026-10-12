import type { MessageDescriptor } from "@lingui/core";

import type { Survey, SurveyProgress } from "@/types/survey";

export interface SurveyQuestionnaireSessionProps {
  survey: Survey;
}

// What stands over the content in a phase: the bar and the controls bar.
export interface SurveyFrame {
  progress?: SurveyProgress; // absent: the bar is not drawn
  label?: MessageDescriptor; // the pill, where it shows neither a category nor the quiz name
  categoryName?: string;
  questionsLeft?: number;
  previousLabel?: MessageDescriptor; // the name of the back control, where it is not the default
  canStepBack: boolean;
  canReset: boolean;
}

export type ChangeDirection = "forwards" | "backwards";

export interface ContentChange {
  contentKey: string;
  direction?: ChangeDirection; // absent until the content has changed once
}

export interface ScreenLock {
  isLocked: boolean;
  lock: () => void;
}
