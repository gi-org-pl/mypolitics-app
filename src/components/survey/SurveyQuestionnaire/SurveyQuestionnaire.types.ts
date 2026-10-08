import type { MessageDescriptor } from "@lingui/core";
import type { ReactNode, Ref } from "react";

import type {
  Survey,
  SurveyLoadState,
  SurveyProgress,
  SurveyQuestion,
} from "@/types/survey";

export interface SurveyQuestionnaireProps {
  load: Exclude<SurveyLoadState, { status: "not-found" }>; // not found is the page's
  onRetry: () => void;
}

export interface SurveyQuestionnaireLoadErrorProps {
  onRetry: () => void;
}

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

export interface SurveyQuestionnaireFrameProps {
  quizName: string;
  frame: SurveyFrame;
  isLocked: boolean;
  topRef: Ref<HTMLDivElement>; // the top of the screen, for the view to return to
  onPrevious: () => void;
  onReset: () => void;
  children: ReactNode;
}

export interface SurveyQuestionnaireTransitionProps {
  contentKey: string;
  direction?: ChangeDirection;
  contentRef: Ref<HTMLDivElement>; // the top of the content, for the focus
  children: ReactNode;
}

export interface SurveyQuestionnaireAnswersProps {
  question: SurveyQuestion;
  onPress: () => void; // an answer was pressed: its acknowledgement starts
  onAnswer: (answerId: string) => void; // the acknowledgement has played
  onSkip: () => void;
}

export interface QuestionActions {
  answer: (answerId: string) => void;
  skip: () => void;
}

export interface HandIn {
  hasFailed: boolean;
  retry: () => void;
}
