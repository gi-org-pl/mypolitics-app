import { Modal } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";
import { useId } from "react";

import { DialogPortal } from "@/components/shared/DialogPortal/DialogPortal";
import {
  INFO_DIALOG_CLASS_NAME,
  INFO_DIALOG_TEXT_CLASS_NAME,
  INFO_DIALOG_TITLE_CLASS_NAME,
} from "@/constants/dialog";

import type { SurveyDemographicsModalProps } from "./SurveyDemographicsModal.types";

export const SurveyDemographicsModal = ({
  isOpen,
  onClose,
}: SurveyDemographicsModalProps) => {
  const descriptionId = useId();

  return (
    <DialogPortal>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        aria-describedby={descriptionId}
        className={INFO_DIALOG_CLASS_NAME}
        title={
          <span className={INFO_DIALOG_TITLE_CLASS_NAME}>
            <Trans>Zakres wykorzystania danych</Trans>
          </span>
        }
      >
        <div
          id={descriptionId}
          className={`${INFO_DIALOG_TEXT_CLASS_NAME} flex flex-col gap-2`}
        >
          <p>
            <Trans>
              Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli
              przeanalizować Twoje wyniki w przyszłości w celu poprawienia
              działania quizu, a także przygotowania analiz na
              data.mypolitics.pl.
            </Trans>
          </p>
          <p className="font-bold">
            <Trans>Twoje dane pozostaną całkowicie anonimowe.</Trans>
          </p>
        </div>
      </Modal>
    </DialogPortal>
  );
};
