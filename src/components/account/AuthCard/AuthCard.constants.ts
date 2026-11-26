import type { AuthCardLayout } from "./AuthCard.types";

// The card's own shape and padding. The frames are drawn 420 px wide with
// 24 px of padding; where the card is given less than 400 px the padding is
// 16 px, so the provider labels keep their line - the card's own width (a
// container query), not the screen's.
//
// On a phone the auth dialog is a bottom sheet: square bottom corners, 16 px
// at the sides, 12 px above the handle and 32 px under the content, as the
// frame of the sheet draws it. From the tablet width up it is the card.
export const CARD_LAYOUT_CLASS_NAMES: Record<AuthCardLayout, string> = {
  card: "rounded-4xl p-4 @min-[25rem]:p-6",
  "sheet-on-phone":
    "rounded-4xl px-4 pt-3 pb-8 max-md:rounded-b-none md:p-4 md:@min-[25rem]:p-6",
};
