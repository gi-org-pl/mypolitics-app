import { type MessageDescriptor } from "@lingui/core";

export interface SurveyQuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface SurveyQuestionProps {
  question: string | MessageDescriptor;
  questionDescription?: string | MessageDescriptor;
  options: SurveyQuestionOption[];
  selectedOptionId?: string;
  onSelectedOptionIdChange: (id: string) => void;
}

export interface DescriptionPanelProps {
  description: string;
  preview: string;
}