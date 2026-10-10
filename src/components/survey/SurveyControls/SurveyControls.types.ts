export interface SurveyControlsProps {
  quizName: string;
  label?: string;
  categoryName?: string;
  questionsLeft?: number;
  isPreviousDisabled?: boolean;
  isResetDisabled?: boolean;
  previousLabel?: string; // accessible name of the back control, passed translated. Default "Poprzednie pytanie"
  onPrevious: () => void;
  onReset: () => void;
}

export type SurveyControlsPillProps = Pick<
  SurveyControlsProps,
  "quizName" | "label" | "categoryName" | "questionsLeft"
>;

export interface SurveyControlsPillContent {
  text?: string;
  count?: number;
}

export interface SurveyControlsCountProps {
  count: number;
}

export interface SurveyControlsResetModalProps {
  quizName: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export type NumberRollDirection = "up" | "down";

export interface NumberRoll {
  value: number;
  previousValue?: number;
  direction: NumberRollDirection;
}

export interface ResetDialog {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  confirm: () => void;
}
