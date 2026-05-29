export type SurveyPhase = "CATEGORY_SELECT" | "QUESTION_ANSWER" | "FINISH";

export interface SurveyControlsProps {
  title: string;
  phase: SurveyPhase;
  categoryName: string;
  questionsLeftnCategory: number;
  answersCount: number;
  onPrevious: () => void;
  onReset: () => void;
}

