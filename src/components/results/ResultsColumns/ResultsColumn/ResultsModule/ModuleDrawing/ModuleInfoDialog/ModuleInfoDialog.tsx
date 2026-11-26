import { Button, Modal } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import { useId } from "react";

import { DialogPortal } from "@/components/shared/DialogPortal/DialogPortal";
import { TALL_BUTTON_CLASS_NAME } from "@/constants/button";
import {
  INFO_DIALOG_CLASS_NAME,
  INFO_DIALOG_TEXT_CLASS_NAME,
  INFO_DIALOG_TITLE_CLASS_NAME,
} from "@/constants/dialog";
import { toTrimmedText } from "@/utils/text/toTrimmedText";

import type { ModuleInfoDialogProps } from "./ModuleInfoDialog.types";

// The explanation of a module: its title and the description of its record,
// in the dialog the questionnaire explains its demographics in. Both are
// written by a quiz author, so they are drawn as text and never as
// markup; the line breaks of the description are kept. Closing the dialog
// hands the focus back to the action that opened it.
export const ModuleInfoDialog = ({
  title,
  description,
  isOpen,
  onClose,
}: ModuleInfoDialogProps) => {
  const { t } = useLingui();
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
            {toTrimmedText(title) ?? t`Informacje`}
          </span>
        }
        actions={
          <Button
            type="primary"
            variant="primary"
            onClick={onClose}
            className={TALL_BUTTON_CLASS_NAME}
          >
            {t`Zamknij`}
          </Button>
        }
      >
        <p
          id={descriptionId}
          className={`${INFO_DIALOG_TEXT_CLASS_NAME} whitespace-pre-line`}
        >
          {toTrimmedText(description)}
        </p>
      </Modal>
    </DialogPortal>
  );
};
