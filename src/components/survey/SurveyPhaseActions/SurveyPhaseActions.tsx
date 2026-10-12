import { Button } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";
import { useId } from "react";

import { toTrimmedText } from "@/utils/text/toTrimmedText";

import {
  PRIMARY_CLASS_NAME,
  SKIP_CLASS_NAME,
} from "./SurveyPhaseActions.constants";
import type { SurveyPhaseActionsProps } from "./SurveyPhaseActions.types";

export const SurveyPhaseActions = ({
  primaryLabel,
  onPrimary,
  isPrimaryDisabled = false,
  primaryDisabledReason,
  onSkip,
}: SurveyPhaseActionsProps) => {
  const reasonId = useId();
  const reason = isPrimaryDisabled
    ? toTrimmedText(primaryDisabledReason)
    : undefined;

  return (
    <div className="flex w-full flex-wrap items-center justify-center">
      <Button
        type="primary"
        variant="primary"
        disabled={isPrimaryDisabled}
        aria-describedby={reason === undefined ? undefined : reasonId}
        onClick={onPrimary}
        className={PRIMARY_CLASS_NAME}
      >
        {primaryLabel}
      </Button>
      {reason !== undefined && (
        <span id={reasonId} className="sr-only">
          {reason}
        </span>
      )}
      <Button
        type="ghost"
        variant="primary"
        onClick={onSkip}
        className={SKIP_CLASS_NAME}
      >
        <Trans>Pomiń</Trans>
      </Button>
    </div>
  );
};
