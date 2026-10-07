import type { QuizCardLogoHeight } from "./QuizCard.types";

// The looks of the card's states. Everything that depends on the width of the
// screen is CSS, so the server and the browser render the same markup; the
// parts of the card and their tests share the class names from here.

export const LOGO_HEIGHT_CLASS_NAMES: Record<QuizCardLogoHeight, string> = {
  24: "h-6",
  32: "h-8",
};

// The image is a strip across the card: short while the card is collapsed,
// twice as tall once it is open.
export const IMAGE_SHORT_CLASS_NAME = "h-25.5";

export const IMAGE_TALL_CLASS_NAME = "h-51";

// A collapsed body is a grid row of no height that is also invisible, so its
// content leaves the tab order and the accessibility tree without any
// attribute that would have to differ between the server and the browser.
export const BODY_OPEN_CLASS_NAME = "visible grid-rows-[1fr]";

export const BODY_COLLAPSED_CLASS_NAME = "invisible grid-rows-[0fr]";

// A card without an image is open on a wide screen whatever its state, and
// has nothing to toggle there: the body shows and the toggle leaves the
// layout, the tab order and the accessibility tree.
export const BODY_OPEN_ON_WIDE_SCREEN_CLASS_NAME =
  "md:visible md:grid-rows-[1fr]";

export const TOGGLE_HIDDEN_ON_WIDE_SCREEN_CLASS_NAME = "md:hidden";
