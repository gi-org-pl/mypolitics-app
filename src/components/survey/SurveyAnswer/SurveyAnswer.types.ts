export type SurveyAnswerType =
  | "strongly-agree"
  | "agree"
  | "disagree"
  | "strongly-disagree"
  | "custom"
  | "custom-selectable";

export interface SurveyAnswerProps {
  title: string;
  type: SurveyAnswerType;
  onClick: () => void;
  isDisabled?: boolean;
  isSelected?: boolean;
}
