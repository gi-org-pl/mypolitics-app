import {
  FIELD_CLASS_NAME,
  RINGS_CLASS_NAME,
  RINGS_DRIFT_CLASS_NAME,
  RINGS_KEYFRAMES,
} from "./SurveyResultsCalculationField.constants";
import type { SurveyResultsCalculationFieldProps } from "./SurveyResultsCalculationField.types";

// The field of rings, and what stands on it. The rings are decoration: they
// are hidden from assistive technology, and take no press.
export const SurveyResultsCalculationField = ({
  isMoving,
  children,
}: SurveyResultsCalculationFieldProps) => (
  <div className={FIELD_CLASS_NAME}>
    <style>{RINGS_KEYFRAMES}</style>
    <span
      aria-hidden="true"
      data-moving={isMoving}
      className={`${RINGS_CLASS_NAME} ${isMoving ? RINGS_DRIFT_CLASS_NAME : ""}`}
    />
    {children}
  </div>
);
