import type { ReactNode } from "react";

import { toTrimmedText } from "@/utils/text/toTrimmedText";

// The description as it is rendered: text is trimmed, and a description with
// nothing to show (blank text, null, a boolean) is undefined.
export const toDescription = (description: ReactNode): ReactNode => {
  if (typeof description === "string") {
    return toTrimmedText(description);
  }

  return description === null || typeof description === "boolean"
    ? undefined
    : description;
};
