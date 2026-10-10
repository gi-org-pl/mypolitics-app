import type { ReactNode } from "react";

export interface SurveyResultsCalculationFieldProps {
  isMoving: boolean; // the rings drift while a run is under way, and stand still otherwise
  children: ReactNode; // what stands on the rings: the lines, or a message
}
