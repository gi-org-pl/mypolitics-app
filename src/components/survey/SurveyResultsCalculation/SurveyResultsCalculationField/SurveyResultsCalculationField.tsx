import { AnimatedHeight } from "@/components/shared/AnimatedHeight/AnimatedHeight";

import {
  FIELD_CLASS_NAME,
  RINGS_CLASS_NAME,
  RINGS_DRIFT_CLASS_NAME,
  RINGS_KEYFRAMES,
} from "./SurveyResultsCalculationField.constants";
import type { SurveyResultsCalculationFieldProps } from "./SurveyResultsCalculationField.types";

// The field of rings, and what stands on it. The rings are decoration: they
// are hidden from assistive technology, and take no press.
//
// What stands on the field is in a box that moves its height. The field is
// as tall as a full stack of one-row lines, so most runs never change it;
// where lines wrap - a narrow screen - the stack outgrows it, and the field,
// the card and the two actions under it then move instead of jumping.
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
    <AnimatedHeight>{children}</AnimatedHeight>
  </div>
);
