import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import arrowLeftIcon from "@/assets/icons/arrow-left.svg";
import resetIcon from "@/assets/icons/reset.svg";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";

import {
  BUTTON_CLASS_NAME,
  BUTTON_ICON_CLASS_NAME,
} from "./SurveyControls.constants";
import type { SurveyControlsProps } from "./SurveyControls.types";
import { SurveyControlsPill } from "./SurveyControlsPill/SurveyControlsPill";
import { SurveyControlsResetModal } from "./SurveyControlsResetModal/SurveyControlsResetModal";
import { useResetDialog } from "./utils/useResetDialog";

export const SurveyControls = ({
  quizName,
  label,
  categoryName,
  questionsLeft,
  isPreviousDisabled = false,
  isResetDisabled = false,
  onPrevious,
  onReset,
}: SurveyControlsProps) => {
  const { t } = useLingui();
  const resetDialog = useResetDialog(onReset, isResetDisabled);

  return (
    <div className="flex w-full items-center justify-between gap-2.5">
      <Button
        type="outlined"
        variant="primary"
        isIconButton
        aria-label={t`Poprzednie pytanie`}
        disabled={isPreviousDisabled}
        onClick={onPrevious}
        className={BUTTON_CLASS_NAME}
      >
        <span
          aria-hidden="true"
          className={`${BUTTON_ICON_CLASS_NAME} h-6 w-5.25`}
          style={getIconMaskStyle(arrowLeftIcon)}
        />
      </Button>
      <SurveyControlsPill
        quizName={quizName}
        label={label}
        categoryName={categoryName}
        questionsLeft={questionsLeft}
      />
      <Button
        type="outlined"
        variant="primary"
        isIconButton
        aria-label={t`Zacznij od nowa`}
        disabled={isResetDisabled}
        onClick={resetDialog.open}
        className={BUTTON_CLASS_NAME}
      >
        <span
          aria-hidden="true"
          className={`${BUTTON_ICON_CLASS_NAME} size-6`}
          style={getIconMaskStyle(resetIcon)}
        />
      </Button>
      <SurveyControlsResetModal
        quizName={quizName}
        isOpen={resetDialog.isOpen}
        onClose={resetDialog.close}
        onConfirm={resetDialog.confirm}
      />
    </div>
  );
};
