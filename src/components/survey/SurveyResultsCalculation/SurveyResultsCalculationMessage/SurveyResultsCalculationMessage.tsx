import { Button } from "@gi-org-pl/athena";

import { TALL_BUTTON_CLASS_NAME } from "@/constants/button";
import { NOTICE_CARD_CLASS_NAME } from "@/constants/notice";
import { focusElement } from "@/utils/dom/focusElement";

import type { SurveyResultsCalculationMessageProps } from "./SurveyResultsCalculationMessage.types";

// What the field says when a run has ended without leaving: a short text and
// its one button, where the lines were. It is announced when it appears, and
// the focus moves to its button, so the next key is the way out.
export const SurveyResultsCalculationMessage = ({
  text,
  actionLabel,
  onAction,
}: SurveyResultsCalculationMessageProps) => (
  <div role="alert" className={NOTICE_CARD_CLASS_NAME}>
    <p className="text-balance">{text}</p>
    <Button
      ref={focusElement}
      type="primary"
      variant="primary"
      onClick={onAction}
      className={TALL_BUTTON_CLASS_NAME}
    >
      {actionLabel}
    </Button>
  </div>
);
