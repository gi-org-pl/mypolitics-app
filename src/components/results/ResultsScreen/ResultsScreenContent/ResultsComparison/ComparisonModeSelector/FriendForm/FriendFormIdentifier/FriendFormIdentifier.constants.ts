import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import checkIcon from "@/assets/icons/checkmark-strong.svg";
import copyIcon from "@/assets/icons/copy.svg";
import { CopyOutcome } from "@/types/common";

// What is said once the copy control was used, by how the copy ended.
export const COPY_STATUS: Record<CopyOutcome, MessageDescriptor> = {
  [CopyOutcome.Copied]: msg`Skopiowano identyfikator.`,
  [CopyOutcome.Failed]: msg`Nie udało się skopiować. Zaznacz identyfikator i skopiuj go ręcznie.`,
};

// The icon of the copy control: a tick once the identifier is on the
// clipboard, the copy icon otherwise.
export const COPY_ICONS: Record<CopyOutcome, string> = {
  [CopyOutcome.Copied]: checkIcon,
  [CopyOutcome.Failed]: copyIcon,
};

export const DEFAULT_COPY_ICON = copyIcon;

// How the status is drawn. A copy that worked is shown by the tick and only
// said to a screen reader; one that failed is written out, since the taker
// has to do something about it.
export const COPY_STATUS_CLASS_NAME: Record<CopyOutcome, string> = {
  [CopyOutcome.Copied]: "sr-only",
  [CopyOutcome.Failed]:
    "text-xs leading-[1.2] font-bold wrap-break-word text-gi-primary",
};
