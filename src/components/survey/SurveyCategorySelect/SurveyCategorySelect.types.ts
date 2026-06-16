import type { ReactNode } from "react";

export interface SurveyCategory {
  id: string;
  name: string;
}

export interface SurveyCategorySelectProps {
  categories: SurveyCategory[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  maxSelection?: number;
  prompt?: ReactNode;
}