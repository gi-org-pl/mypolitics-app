import { useCallback, useState } from "react";

import { toTrimmedText } from "@/utils/text/toTrimmedText";

import type { ModuleInfo } from "../ModuleDrawing.types";

// The explanation of a module: open or closed, and how to open and close it.
// A module whose record has no description has no way to open it, so its
// card shows no info action.
export const useModuleInfo = (description?: string): ModuleInfo => {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  // Athena's Modal re-runs its focus handling whenever onClose changes, so the
  // function it gets has to stay the same between renders.
  const close = useCallback(() => setIsOpen(false), []);
  const hasDescription = toTrimmedText(description) !== undefined;

  return {
    isOpen: isOpen && hasDescription,
    open: hasDescription ? open : undefined,
    close,
  };
};
