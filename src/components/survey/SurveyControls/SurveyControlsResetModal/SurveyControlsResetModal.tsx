import { Button, Modal } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import { useId } from "react";

import resetIcon from "@/assets/icons/reset.svg";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

import { SurveyDialogPortal } from "../../SurveyDialogPortal/SurveyDialogPortal";
import { BUTTON_ICON_CLASS_NAME } from "../SurveyControls.constants";
import type { SurveyControlsResetModalProps } from "../SurveyControls.types";
import {
  RESET_ACTION_CLASS_NAME,
  RESET_DESCRIPTION_CLASS_NAME,
  RESET_MODAL_CLASS_NAME,
  RESET_TITLE_CLASS_NAME,
} from "./SurveyControlsResetModal.constants";

export const SurveyControlsResetModal = ({
  quizName: rawQuizName,
  isOpen,
  onClose,
  onConfirm,
}: SurveyControlsResetModalProps) => {
  const { t } = useLingui();
  const descriptionId = useId();
  const quizName = toTrimmedText(rawQuizName);

  return (
    <SurveyDialogPortal>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        aria-describedby={descriptionId}
        className={RESET_MODAL_CLASS_NAME}
        title={
          <span
            className={RESET_TITLE_CLASS_NAME}
          >{t`Rozpocząć od nowa?`}</span>
        }
        description={
          <span id={descriptionId} className={RESET_DESCRIPTION_CLASS_NAME}>
            {quizName === undefined
              ? t`Czy na pewno chcesz rozpocząć quiz od nowa? Twoje odpowiedzi nie zostaną zapisane.`
              : t`Czy na pewno chcesz rozpocząć quiz ${quizName} od nowa? Twoje odpowiedzi nie zostaną zapisane.`}
          </span>
        }
        actions={
          <Button
            type="primary"
            variant="danger"
            onClick={onConfirm}
            className={RESET_ACTION_CLASS_NAME}
            RightIcon={
              <span
                className={`${BUTTON_ICON_CLASS_NAME} size-4`}
                style={getIconMaskStyle(resetIcon)}
              />
            }
          >
            {t`Resetuj quiz`}
          </Button>
        }
      />
    </SurveyDialogPortal>
  );
};
