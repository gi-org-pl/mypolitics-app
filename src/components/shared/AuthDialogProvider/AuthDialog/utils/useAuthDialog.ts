import { useId, useRef, useState } from "react";

import { useDialogFocus } from "./useDialogFocus";

// The dialog's identifiers, its focus, and closing it - which is refused
// while the account is being saved, so the save cannot be left half-done.
export const useAuthDialog = (onClose: () => void) => {
  const headingId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isBusy, setIsBusy] = useState(false);
  const close = () => {
    if (!isBusy) onClose();
  };
  const onKeyDown = useDialogFocus(dialogRef, close);

  return {
    headingId,
    descriptionId,
    dialogRef,
    close,
    onKeyDown,
    setIsBusy,
  };
};
