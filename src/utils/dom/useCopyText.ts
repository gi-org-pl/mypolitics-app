import { useCallback, useState } from "react";

import { CopyOutcome } from "@/types/common";

import { copyText } from "./copyText";

interface TextCopy {
  outcome?: CopyOutcome; // how the last copy ended. Absent = nothing was copied yet
  copy: () => void;
}

// Copies a text to the clipboard on demand, and remembers how the last copy
// ended, so that the control can say it. A copy never fails loudly: where the
// Clipboard API is not there, or refuses, the outcome is "failed" and the
// text has to be copied by hand.
export const useCopyText = (text: string): TextCopy => {
  const [outcome, setOutcome] = useState<CopyOutcome>();
  const copy = useCallback(() => {
    copyText(text).then((isCopied) =>
      setOutcome(isCopied ? CopyOutcome.Copied : CopyOutcome.Failed),
    );
  }, [text]);

  return { outcome, copy };
};
