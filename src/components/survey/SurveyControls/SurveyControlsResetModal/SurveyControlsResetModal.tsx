import { Button, Modal } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import resetIcon from "@/assets/icons/reset.svg";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

import { ICON_CLASS_NAME } from "../SurveyControls.constants";
import type { SurveyControlsResetModalProps } from "../SurveyControls.types";

export const SurveyControlsResetModal = ({
  quizName: rawQuizName,
  isOpen,
  onClose,
  onConfirm,
}: SurveyControlsResetModalProps) => {
  const { t } = useLingui();
  const quizName = toTrimmedText(rawQuizName);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t`Rozpocząć od nowa?`}
      description={
        quizName === undefined
          ? t`Czy na pewno chcesz rozpocząć quiz od nowa? Twoje odpowiedzi nie zostaną zapisane.`
          : t`Czy na pewno chcesz rozpocząć quiz ${quizName} od nowa? Twoje odpowiedzi nie zostaną zapisane.`
      }
      actions={
        <Button
          type="primary"
          variant="danger"
          onClick={onConfirm}
          RightIcon={
            <span
              className={`${ICON_CLASS_NAME} size-4`}
              style={{ maskImage: `url("${resetIcon}")` }}
            />
          }
        >
          {t`Resetuj quiz`}
        </Button>
      }
    />
  );
};
