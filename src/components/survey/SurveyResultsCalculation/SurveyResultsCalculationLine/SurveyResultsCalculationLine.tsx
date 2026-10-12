import spinnerIcon from "@/assets/icons/spinner.svg";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import {
  CURRENT_LINE_CLASS_NAME,
  FINISHED_LINE_CLASS_NAME,
  LINE_CLASS_NAME,
  SPINNER_CLASS_NAME,
} from "./SurveyResultsCalculationLine.constants";
import type { SurveyResultsCalculationLineProps } from "./SurveyResultsCalculationLine.types";

// One line of a run, as a pill. The current line has a spinner in front of
// its text; the spinner is decoration and a line is not a control.
export const SurveyResultsCalculationLine = ({
  text,
  isCurrent,
}: SurveyResultsCalculationLineProps) => (
  <li
    data-current={isCurrent}
    className={`${LINE_CLASS_NAME} ${
      isCurrent ? CURRENT_LINE_CLASS_NAME : FINISHED_LINE_CLASS_NAME
    }`}
  >
    {isCurrent && (
      <span
        aria-hidden="true"
        className={SPINNER_CLASS_NAME}
        style={getIconMaskStyle(spinnerIcon)}
      />
    )}
    <span className="min-w-0">{text}</span>
  </li>
);
