import { SURVEY_PHASE } from "./SurveyControls.constants";

export type SurveyPhase = typeof SURVEY_PHASE[keyof typeof SURVEY_PHASE];

export interface SurveyControlsProps {
  title: string;
  phase: SurveyPhase;
  categoryName: string;
  questionsLeftnCategory: number;
  answersCount: number;
  onPrevious: () => void;
  onReset: () => void;
}
