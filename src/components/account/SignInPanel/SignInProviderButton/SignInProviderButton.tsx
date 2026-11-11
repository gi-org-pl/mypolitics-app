import { Button } from "@gi-org-pl/athena";

import spinnerIcon from "@/assets/icons/spinner-ring.svg";

import { BUTTON_CLASS_NAME } from "./SignInProviderButton.constants";
import type { SignInProviderButtonProps } from "./SignInProviderButton.types";

// The secondary pill of the app: white, a hairline outline, the bold label in
// the middle. Only the mark at its left edge is the provider's.
//
// The mark, the label and a slot as wide as the mark stand in a row, so the
// label sits in the middle of the pill. On a narrow phone the slot on the
// right gives up its room first, so the label moves a little right of the
// middle; only when that is not enough does the label wrap. It is never cut.
//
// While its provider is waited for, the button keeps its mark, shows the
// waiting label and a spinner in the slot, and is busy: a press does
// nothing. It stays focusable, so focus is not thrown out of the card. The
// other buttons are disabled and drawn at 40%.
export const SignInProviderButton = ({
  mark,
  label,
  isWaiting = false,
  isDisabled = false,
  onSelect,
}: SignInProviderButtonProps) => (
  <Button
    type="outlined"
    variant="primary"
    className={`${BUTTON_CLASS_NAME} ${isWaiting ? "cursor-wait" : ""}`}
    disabled={isDisabled}
    aria-busy={isWaiting}
    aria-disabled={isWaiting || isDisabled}
    onClick={() => {
      if (!isWaiting) onSelect();
    }}
  >
    <img src={mark} alt="" className="size-5 shrink-0" />
    <span className="min-w-0 flex-[1_1_auto] text-center whitespace-normal">
      {label}
    </span>
    <span className="flex w-5 min-w-0 shrink-[100] items-center justify-center">
      {isWaiting && (
        <img
          src={spinnerIcon}
          alt=""
          className="size-5 max-w-none animate-spin motion-reduce:animate-none"
        />
      )}
    </span>
  </Button>
);
