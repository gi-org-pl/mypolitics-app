import { useCallback, useState } from "react";

import type { ResetDialog } from "../SurveyControls.types";

export const useResetDialog = (
  onReset: () => void,
  isDisabled: boolean,
): ResetDialog => {
  const [isOpen, setIsOpen] = useState(false);
  // Athena's Modal re-runs its focus handling whenever onClose changes, so the
  // function it gets has to stay the same between renders.
  const close = useCallback(() => setIsOpen(false), []);

  if (isDisabled && isOpen) {
    setIsOpen(false);
  }

  return {
    isOpen,
    open: () => setIsOpen(true),
    close,
    confirm: () => {
      if (!isOpen) {
        return;
      }

      onReset();
      setIsOpen(false);
    },
  };
};
